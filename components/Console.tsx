"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Minimize2, Maximize2, Terminal } from "lucide-react"
import { useWebContainer } from "@/app/hooks/useContainer"

interface CommandOutput {
  id: string
  command: string
  output: string
  timestamp: Date
}

const Console: React.FC = () => {
  const [history, setHistory] = useState<CommandOutput[]>([])
  const [currentCommand, setCurrentCommand] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { webContainer } = useWebContainer();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const executeCommand = async (command: string) => {

    if (!command) return;
    if (command === "clear") {
      setHistory([]);
      setCurrentCommand("")
      return;
    }

    const trimmedCommand = command.trim();
    if (!trimmedCommand || !webContainer) return;

    const [cmd, ...args] = trimmedCommand.split(/\s+/);

    try {
      const process = await webContainer.spawn(cmd, args, {
        cwd: '/my-app',
      });
      const stdout = process.output;

      let text = "";

      stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            text += chunk as string;
            setHistory((prev) => {
              const lastItem = prev[prev.length - 1];
              if (lastItem && lastItem.command === trimmedCommand) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastItem,
                    output: text,
                  },
                ];
              }
              return [
                ...prev,
                {
                  id: Date.now().toString(),
                  command: trimmedCommand,
                  output: text,
                  timestamp: new Date(),
                },
              ];
            });
          },
        })
      );

      setCurrentCommand("")

      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }

    } catch (err) {
      console.error("Error executing command:", err);
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          command: trimmedCommand,
          output: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await executeCommand(currentCommand)
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getPrompt = () => {
    return `$~`
  }

  return (
    <div className={`flex flex-col ${isExpanded ? 'h-[40vh]' : 'h-fit' }  transition-all duration-200 overflow-hidden`}>
      {/* Header */}
      <div className="h-9 border bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Terminal size={16} className="mr-2 text-neutral-500" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
            title={isExpanded ? "Minimize console" : "Expand console"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {
        isExpanded && (
          <div className="flex-1 h-full pb-4 bg-black text-green-400 font-mono text-sm overflow-hidden">
            {/* Output Area */}
            <div ref={outputRef} className="h-full overflow-y-auto p-4 pb-0" onClick={() => inputRef.current?.focus()}>
              {/* Welcome Message */}

              {/* Command History */}
              {history.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex items-center">
                    <span className="text-green-300 mr-2">{getPrompt()}</span>
                    <span className="text-white">{item.command}</span>
                  </div>
                  {item.output && <div className="text-gray-300 whitespace-pre-wrap ml-0 mt-1">{item.output}</div>}
                </div>
              ))}

              {/* Current Input Line */}
              <div className="flex items-center">
                <span className="text-green-300 mr-2">{getPrompt()}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white outline-none font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Console
