"use client"

import { useChatTime } from "@/hooks/use-chat-time"

interface ChatTimeProps {
  dateTime: string
  summary?: boolean
  className?: string
}

export default function ChatTime({
  dateTime,
  summary = false,
  className,
}: ChatTimeProps) {
  const { text, title } = useChatTime(dateTime, summary)
  return (
    <time dateTime={dateTime} title={title} className={className}>
      {text}
    </time>
  )
}
