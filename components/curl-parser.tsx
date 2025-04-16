"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { parseCurl } from "@/lib/curl-parser"
import { ApiConfigurator } from "./api-configurator"

export function CurlParser({ projectId }: { projectId: string }) {
  const [curlCommand, setCurlCommand] = useState("")
  const [parsedData, setParsedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    try {
      if (!curlCommand.trim()) {
        setError("Please enter a curl command")
        return
      }

      const parsed = parseCurl(curlCommand)
      setParsedData(parsed)
      setError(null)
    } catch (err) {
      setError("Failed to parse curl command. Please check the format.")
      console.error(err)
    }
  }

  const handleReset = () => {
    setCurlCommand("")
    setParsedData(null)
    setError(null)
  }

  return (
    <Card className="w-full border-neonBlue-100 dark:border-neonBlue-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-neonBlue-700 dark:text-neonBlue-400">Parse cURL Command</CardTitle>
        <CardDescription>Paste a cURL command to generate a fake API endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        {!parsedData ? (
          <>
            <Textarea
              placeholder="Paste your cURL command here..."
              className="min-h-[150px] sm:min-h-[200px] font-mono text-sm border-neonBlue-200 dark:border-neonBlue-800 focus-visible:ring-neonBlue-500"
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </>
        ) : (
          <ApiConfigurator parsedData={parsedData} onReset={handleReset} projectId={projectId} />
        )}
      </CardContent>
      {!parsedData && (
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto order-2 sm:order-1 border-neonBlue-200 hover:bg-neonBlue-50 dark:border-neonBlue-800 dark:hover:bg-neonBlue-900/50"
          >
            Reset
          </Button>
          <Button
            onClick={handleParse}
            className="w-full sm:w-auto order-1 sm:order-2 bg-neonBlue-600 hover:bg-neonBlue-700"
          >
            Parse cURL
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
