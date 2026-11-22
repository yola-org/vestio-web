import ChatTime from "./ChatTime"
import type { ResolvedChatMessageGroup } from "@/components/events/resolvers/chat-resolver"

export default function ChatMessageItem({
  message,
}: {
  message: ResolvedChatMessageGroup
}) {
  if (message.system)
    return (
      <li className="mx-auto w-[90%] py-2 text-center">
        <p className="text-sm leading-6 text-primary/65 [overflow-wrap:anywhere]">
          {message.content}
        </p>
        <ChatTime
          dateTime={message.createdAt}
          className="mt-2 block text-[10px] text-primary/35"
        />
      </li>
    )
  return (
    <li className={`flex ${message.own ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] sm:max-w-[75%]">
        {!message.own && message.senderName !== undefined && (
          <p className="mb-1.5 px-1 text-[11px] font-semibold text-primary/45">
            {message.senderName}
          </p>
        )}
        <div
          className={`flex flex-col gap-1 ${
            message.own ? "items-end" : "items-start"
          }`}
        >
          {message.messages.map((part) => (
            <div
              key={part.id}
              className={`rounded-2xl px-4 py-3 text-sm leading-6 [overflow-wrap:anywhere] ${
                message.own
                  ? "rounded-ee-sm bg-primary text-white"
                  : "rounded-es-sm border border-primary/8 bg-white text-primary"
              }`}
            >
              {part.content}
            </div>
          ))}
        </div>
        <ChatTime
          dateTime={message.createdAt}
          className={`mt-1.5 block px-1 text-[10px] text-primary/35 ${
            message.own ? "text-end" : ""
          }`}
        />
      </div>
    </li>
  )
}
