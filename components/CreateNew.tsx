'use client'
import { useUser } from '@clerk/nextjs';
import { IconLoader2 } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

export default function CreateAppPage() {

  const router = useRouter();
  const userId = useUser().user?.id;
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [language, setLanguage] = useState<"javascript" | "python" | "express" | "vite">("vite");

  function generateTemplateId() {
    const adjectives = [
      "frosty", "silent", "brave", "cosmic", "sunny",
      "wild", "ancient", "lucky", "stormy", "breezy"
    ]

    const nouns = [
      "whale", "falcon", "panther", "otter", "dragon",
      "cactus", "comet", "wolf", "glacier", "eclipse"
    ]

    function getRandomItem(arr: string[]) {
      return arr[Math.floor(Math.random() * arr.length)]
    }

    function generateUniqueCode(length = 8) {
      return Math.random().toString(36).slice(2, 2 + length)
    }

    const adjective = getRandomItem(adjectives)
    const noun = getRandomItem(nouns)
    const code = generateUniqueCode(8)

    return `${adjective}_${noun}_${code}`
  }


  useEffect(() => {
    setTemplateName(generateTemplateId());
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api", {
        userId,
        name: templateName,
        privacy: privacy,
        type: language,
      })
      if (language === "vite") {
        // Redirect to Vite project page
        router.push(`/vite/${userId}/${res.data.template.id}`);
      } else {
        // Redirect to main project page
        router.push(`/main/${userId}/${res.data.template.id}`);
      }
      router.refresh()
    } catch (error) {
      console.log("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1424] text-white p-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Create a new App</h1>

        <div className="mb-8 border-b border-gray-700">
          <div className="flex">
            <button className="px-6 py-3 text-white border-b-2 border-white">Choose a Template</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-2">Template</label>
            <div className="mb-4">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2 p-3 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <div className="relative">
                    <input
                      onClick={() => setLanguage("vite")}
                      type="radio"
                      name="language"
                      defaultChecked
                      className="appearance-none h-4 w-4 rounded-full border border-gray-500 checked:border-blue-500 checked:border-4 transition-all duration-200 ease-in-out"
                    />
                  </div>
                  <span className='flex justify-center items-center gap-3'>Vite + React <span className='text-xs font-semibold font-sans p-0.5 rounded border border-blue-400 bg-blue-800 text-blue-300'>new</span></span>
                </label>
                <label className="flex items-center space-x-2 p-3 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <div className="relative">
                    <input
                      onClick={() => setLanguage("javascript")}
                      type="radio"
                      name="language"
                      className="appearance-none h-4 w-4 rounded-full border border-gray-500 checked:border-blue-500 checked:border-4 transition-all duration-200 ease-in-out"
                    />
                  </div>
                  <span>JavaScript</span>
                </label>
                <label className="flex items-center space-x-2 p-3 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <div className="relative">
                    <input
                      onClick={() => setLanguage("python")}
                      type="radio"
                      name="language"
                      className="appearance-none h-4 w-4 rounded-full border border-gray-500 checked:border-blue-500 checked:border-4 transition-all duration-200 ease-in-out"
                    />
                  </div>
                  <span>Python</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                onChange={(e => setTemplateName(e.target.value))}
                value={templateName || ""}
                type="text"
                placeholder="Name your App"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Privacy</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      onClick={() => setPrivacy("public")}
                      type="radio"
                      name="privacy"
                      className="appearance-none h-4 w-4 rounded-full border border-gray-500 checked:border-blue-500 checked:border-4 transition-all duration-200 ease-in-out"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Globe Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Public</span>
                  </div>
                </label>
                <p className="text-sm text-gray-400 ml-7">Anyone can view and fork this App.</p>

                <label className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      onClick={() => setPrivacy("private")}
                      type="radio"
                      name="privacy"
                      className="appearance-none h-4 w-4 rounded-full border border-gray-500 checked:border-blue-500 checked:border-4 transition-all duration-200 ease-in-out"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Private</span>
                    <span className="bg-orange-700 text-white text-xs px-2 py-0.5 rounded">Core</span>
                  </div>
                </label>
                <p className="text-sm text-gray-400 ml-7">Only you can see and edit this App.</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="flex">
                  <div className="h-full bg-yellow-500 w-1/3"></div>
                  <div className="h-full bg-yellow-500 w-1/3"></div>
                  <div className="h-full bg-gray-600 w-1/3"></div>
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="disabled:opacity-70 disabled:cursor-auto cursor-pointer w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded transition-colors">
              {
                loading ? (
                  <IconLoader2 className='animate-spin h-5 w-5 text-white' />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )
              }
              <span>{loading ? "Creating..." : "Create App"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

