"use client"
import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import type { OnChange } from "@monaco-editor/react"
import { IconTriangle } from "@tabler/icons-react"
import { useWebContainer } from "@/app/hooks/useContainer"
import axios from "axios"
import { useParams } from "next/navigation"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
})

export default function Home() {
  const [code, setCode] = useState<string>("")
  const codeRef = useRef(code)
  const [output, setOutput] = useState("")
  const [language, setLanguage] = useState<string>("javascript")
  const [command, setCommand] = useState("")
  const [terminalOutput, setTerminalOutput] = useState("")
  const terminalRef = useRef<HTMLPreElement>(null)
  const params = useParams()
  const templateId = params.templateId
  const { webContainer, isLoading, error } = useWebContainer();

  async function runCommand() {
    if (!webContainer || !command.trim()) return

    setTerminalOutput((prev) => prev + `\n$ ${command}\n`)

    if (language === "javascript") {
      const installCommand = command.split(" ")[0]
      const process = await webContainer.spawn(installCommand, [...command.split(" ").slice(1)])
      const reader = process.output.getReader()

      let outputText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        outputText += value
        setTerminalOutput((prev) => prev + value)
      }
      console.log(outputText)
    }
    setCommand("")
  }

  async function save() {
    console.log("codeRef", codeRef.current)
    const res = await axios.post(`/api/save`, {
      templateID: templateId,
      content: codeRef.current,
    })
    return res
  }

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      console.log("code", code)
      const res = await save();
      console.log("save", res)
      if (res.data.success) {
        window.alert("Template saved successfully!")
      }
    }
  }

  useEffect(() => {
    codeRef.current = code
  }, [code])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  useEffect(() => {

    async function fetchTemplate() {
      const res = await axios.post(`/api/template`, {
        templateID: templateId,
      })
      
      setCode(res.data.content)
      setLanguage(res.data.type)
    }

    fetchTemplate()

    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }

    return () => {
      // teardown()
    }

  }, [terminalOutput, templateId])

  

  async function runCode() {
    if (language === "javascript") {
      console.log("runCode")
      if (!webContainer) {
        console.error("WebContainer not initialized")
        setOutput("WebContainer not initialized yet.")
        return
      }

      try {
        setOutput("Running...")
        await webContainer.fs.writeFile("index.js", code)
        await webContainer.spawn("npm", ["install"])
        const process = await webContainer.spawn("node", ["index.js"])
        let outputText = ""
        const reader = process.output.getReader()

        async function processOutput() {
          try {
            while (true) {
              console.log("Reading output...")
              console.log(outputText)
              const { done, value } = await reader.read()

              if (done) {
                break
              }

              outputText += value
              setOutput(stripAnsiCodes(outputText))
            }
          } catch (error) {
            console.error("Error reading output:", error)
          } finally {
            reader.releaseLock()
          }
        }
        const outputPromise = processOutput()
        const exitCode = await process.exit
        await outputPromise

        if (exitCode !== 0) {
          setOutput((prev) => prev + `\n\nProcess exited with code ${exitCode}`)
        }
      } catch (error) {
        console.error("Error running code:", error)
        if (error instanceof Error) {
          setOutput(`Error: ${error.message || "An unknown error occurred"}`)
        }
      }
    } else if (language === "python") {
      if (!webContainer) {
        console.error("WebContainer not initialized")
        setOutput("WebContainer not initialized yet.")
        return
      }

      await webContainer.fs.writeFile("script.py", code)
      const process = await webContainer.spawn("python3", ["script.py"])

      let outputText = ""
      const reader = process.output.getReader()

      async function processOutput() {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            outputText += value
            setOutput(outputText)
          }
        } catch (error) {
          console.error("Error reading output:", error)
        } finally {
          reader.releaseLock()
        }
      }

      const outputPromise = processOutput()
      await process.exit
      await outputPromise
    }
  }

  function stripAnsiCodes(text: string) {
    return text.replace(/\x1B\[[0-9;]*m/g, "")
  }

  return (
    <div className="p-4 w-full flex flex-col ml-12 md:ml-0 h-full overflow-y-scroll bg-neutral-800 text-white">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold w-full">Browser-Based Code Execution</h1>
        <div className="w-full pr-7 md:pr-0 gap-0.5 md:justify-start justify-end items-center flex">
          <button
            onClick={
              async () => {
                const res = await save();
                if (res.data.success) {
                  window.alert("Template saved successfully!")
                }
              }}
            disabled={isLoading || !webContainer}
            className={`px-4 py-2 cursor-pointer flex justify-center text-sm items-center rounded font-medium ${isLoading || !webContainer
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
          >
            {isLoading ? "Initializing..." : "Save"}
          </button>
          <button
            onClick={runCode}
            disabled={isLoading || !webContainer}
            className={`px-4 py-2 cursor-pointer h-fit flex justify-center text-sm items-center rounded font-medium ${isLoading || !webContainer
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
          >
            {isLoading ? "Initializing..." : "Run"}
            <IconTriangle className="md:ml-1 ml-0.5 rotate-90 w-3 h-3" />
          </button>
        </div>
      </div>
      {error ? (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold mb-2">Error:</h2>
          <p className="mb-2">{error}</p>
          <p className="mb-2">
            WebContainer requires cross-origin isolation to work properly. You need to configure your Next.js server
            with the appropriate security headers.
          </p>
          <details className="mt-2">
            <summary className="font-medium cursor-pointer">Show configuration instructions</summary>
          </details>
        </div>
      ) : (
        <div className="flex h-full flex-col lg:flex-row gap-4 w-full">
          {/* Code Editor Section */}
          <div className="w-full lg:h-full lg:w-2/3 flex flex-col">
            <div className="border border-gray-700 rounded-md overflow-hidden h-[400px] lg:h-full">
              <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={setCode as OnChange}
                options={{
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: "on",
                  formatOnPaste: true,
                }}
              />
            </div>

          </div>

          {/* Terminal and Output Section */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {/* Terminal */}
            <div className="border h-full border-gray-700 rounded-md overflow-hidden">
              <h2 className="font-semibold p-2 bg-gray-700">Browser Terminal</h2>
              {language === "python" && (
                <p className="font-sans font-light text-red-500 px-2 py-1 bg-gray-900">
                  Note: Python packages are not supported yet. You can run Python code, but package installation is not
                  available.
                </p>
              )}
              <div className="relative w-full h-full">
                <pre ref={terminalRef} className="bg-gray-900 p-4 rounded overflow-auto h-full whitespace-pre-wrap">
                  {terminalOutput}
                </pre>
                {
                  language === "javascript" && (<div className="flex absolute top-0 border-t border-gray-700 w-full">
                    <span className="bg-gray-800 p-2 text-white font-bold">$~</span>
                    <input
                      className="bg-gray-800 p-0 text-white placeholder:text-gray-400 outline-none ring-0 focus:outline-none w-full"
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="Type a command (e.g., npm install express)"
                      onKeyDown={(e) => e.key === "Enter" && runCommand()}
                    />
                  </div>)
                }
              </div>
            </div>
            <div className="h-[400px] lg:h-full border border-gray-700 rounded-md overflow-hidden">
              <h2 className="font-semibold p-2 bg-gray-700">Output</h2>
              <pre className="bg-gray-900 h-full p-4 rounded overflow-auto whitespace-pre-wrap">
                {output || "// Run your code to see output here"}
              </pre>
            </div>
            <div className="h-full border-gray-700 w-full border rounded">

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

