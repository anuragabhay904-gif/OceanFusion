import {
  Bot,
  Loader2,
  Send,
  User,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  sendChatQuery,
} from "../api";

import type {
  ChatResponse,
} from "../types";


interface ChatPanelProps {
  onResponse?: (
    response: ChatResponse
  ) => void;
}


interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}


const SUGGESTIONS = [
  "Show the temperature profile of an ARGO float.",
  "How does salinity correlate with biodiversity?",
  "What biodiversity records are available?",
  "Give me an overview of the ocean data.",
];


export default function ChatPanel({
  onResponse,
}: ChatPanelProps) {

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Welcome to OceanFusion. Ask about ARGO observations, ocean conditions, biodiversity, or relationships between physical ocean parameters and biological diversity.",
    },
  ]);


  const [
    input,
    setInput,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  async function submitQuery(
    query: string
  ): Promise<void> {

    const trimmed =
      query.trim();


    if (!trimmed || loading) {
      return;
    }


    setError(null);


    setMessages(
      previous => [
        ...previous,

        {
          id:
            Date.now(),

          role:
            "user",

          content:
            trimmed,
        },
      ]
    );


    setInput("");

    setLoading(true);


    try {

      const response =
        await sendChatQuery(
          trimmed,
          "oceanfusion-web"
        );


      /*
      |--------------------------------------------------------------------------
      | Add assistant answer
      |--------------------------------------------------------------------------
      */

      setMessages(
        previous => [
          ...previous,

          {
            id:
              Date.now() + 1,

            role:
              "assistant",

            content:
              response.answer ||
              "I received the request but there was no answer.",
          },
        ]
      );


      /*
      |--------------------------------------------------------------------------
      | Send complete response to App.tsx
      |--------------------------------------------------------------------------
      */

      if (onResponse) {
        onResponse(
          response
        );
      }

    } catch (err: unknown) {

      /*
      |--------------------------------------------------------------------------
      | Robust error conversion
      |--------------------------------------------------------------------------
      */

      let message =
        "I could not process that request.";


      if (
        err instanceof Error
      ) {

        message =
          err.message;

      } else if (
        typeof err === "string"
      ) {

        message =
          err;

      } else if (
        err &&
        typeof err === "object"
      ) {

        try {

          message =
            JSON.stringify(
              err
            );

        } catch {

          message =
            "An unexpected error occurred.";

        }
      }


      setError(
        message
      );


      setMessages(
        previous => [
          ...previous,

          {
            id:
              Date.now() + 1,

            role:
              "assistant",

            content:
              `I could not process that request: ${message}`,
          },
        ]
      );

    } finally {

      setLoading(false);
    }
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {

    event.preventDefault();

    await submitQuery(
      input
    );
  }


  async function handleSuggestion(
    suggestion: string
  ): Promise<void> {

    await submitQuery(
      suggestion
    );
  }


  return (
    <section className="chat-panel">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="chat-header">

        <div className="chat-header-icon">

          <Bot
            size={18}
          />

        </div>


        <div className="chat-header-content">

          <div className="panel-eyebrow">
            OCEANFUSION AI
          </div>


          <h2>
            Research Assistant
          </h2>

        </div>


        <div
          className={
            loading
              ? "chat-status chat-status-loading"
              : "chat-status"
          }
        >

          <span />

          {loading
            ? "Working"
            : "Ready"}

        </div>

      </div>


      {/* ============================================================
          MESSAGES
      ============================================================ */}

      <div className="chat-messages">

        {messages.map(
          message => (

            <div
              key={
                message.id
              }
              className={
                message.role ===
                "user"
                  ? "chat-message chat-message-user"
                  : "chat-message chat-message-assistant"
              }
            >

              <div className="message-avatar">

                {message.role ===
                "user" ? (
                  <User
                    size={14}
                  />
                ) : (
                  <Bot
                    size={14}
                  />
                )}

              </div>


              <div className="message-content">

                <span className="message-role">
                  {message.role ===
                  "user"
                    ? "You"
                    : "OceanFusion AI"}
                </span>


                <p>
                  {
                    message.content
                  }
                </p>

              </div>

            </div>

          )
        )}


        {loading && (

          <div className="chat-message chat-message-assistant">

            <div className="message-avatar">

              <Bot
                size={14}
              />

            </div>


            <div className="message-content">

              <span className="message-role">
                OceanFusion AI
              </span>


              <p className="chat-thinking">

                <Loader2
                  size={13}
                  className="spin"
                />

                Analyzing ocean data...

              </p>

            </div>

          </div>

        )}

      </div>


      {/* ============================================================
          SUGGESTIONS
      ============================================================ */}

      {messages.length === 1 && (

        <div className="chat-suggestions">

          <div className="suggestions-label">
            TRY ASKING
          </div>


          <div className="suggestions-grid">

            {SUGGESTIONS.map(
              suggestion => (

                <button
                  key={
                    suggestion
                  }
                  type="button"
                  className="suggestion-button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    void handleSuggestion(
                      suggestion
                    )
                  }
                >

                  <span>
                    {
                      suggestion
                    }
                  </span>

                </button>

              )
            )}

          </div>

        </div>

      )}


      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (

        <div
          className="chat-error"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ============================================================
          INPUT
      ============================================================ */}

      <form
        className="chat-input-area"
        onSubmit={
          handleSubmit
        }
      >

        <input
          type="text"
          value={
            input
          }
          onChange={event =>
            setInput(
              event.target.value
            )
          }
          placeholder="Ask about ocean or biodiversity data..."
          disabled={
            loading
          }
          aria-label="Ask OceanFusion AI"
        />


        <button
          type="submit"
          className="chat-send-button"
          disabled={
            loading ||
            !input.trim()
          }
          aria-label="Send message"
        >

          {loading ? (
            <Loader2
              size={17}
              className="spin"
            />
          ) : (
            <Send
              size={17}
            />
          )}

        </button>

      </form>

    </section>
  );
}