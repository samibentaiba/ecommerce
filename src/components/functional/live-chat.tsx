
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send } from "lucide-react"

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: "agent", timestamp: new Date() },
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        sender: "user" as const,
        timestamp: new Date(),
      }
      setMessages([...messages, userMessage])
      setNewMessage("")

      // Simulate agent response
      setTimeout(() => {
        const agentMessage = {
          id: messages.length + 2,
          text: "Thanks for your message! Our team will get back to you shortly.",
          sender: "agent" as const,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentMessage])
      }, 1000)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-lg z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg text-sm ${
                message.sender === "user"
                  ? "bg-blue-500 text-white ml-auto max-w-[80%]"
                  : "bg-gray-100 text-gray-900 mr-auto max-w-[80%]"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

