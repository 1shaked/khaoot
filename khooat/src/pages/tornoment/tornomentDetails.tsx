import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useMutation } from "@tanstack/react-query";
import { customFetch } from "@/utils/HttpClient";
import { toast } from "@/components/ui/use-toast";
import { useAtom, useAtomValue } from "jotai";
import { QuestionsAtom } from "./state";
import { z } from 'zod';
import { UserGlobalAtom } from "@/state/User";

const AnswerSchema = z.object({
  id: z.number(),
  question_id: z.number(),
  title: z.string(),
  is_correct: z.boolean(),
  answerToQuestionInTor: z.number().nullable(),
  // Assuming 'question' and 'answerToQuestionInTor' are intentionally omitted because they're null
  // If they can be null and you want to include them, use z.null() or make them optional
});

const QuestionSchema = z.object({
  id: z.number(),
  Questionnaire_id: z.number(),
  answerToQuestionInTor:  z.object({
    answer_id: z.number(),
  }).optional().nullable(),
  title: z.string(),
  points: z.number(),
  question_time: z.number(),
  answers: z.array(AnswerSchema),
  // Similar to above, 'Questionnaire' and 'answerToQuestionInTor' are omitted
  // Include them as z.null() if they should be validated as null
});

const QuestionAnswersZod = z.array(QuestionSchema);
export type QuestionAnswers = z.infer<typeof QuestionAnswersZod>;

export function TornomentDetails() {
    // get the id from the url
    const { id } = useParams();

    // useEffect(() => {
    //     const ws = new WebSocket("ws://localhost:8000/ws" );

    //     ws.send('sdad')
    //     ws.onmessage = function(event) {
    //         debugger
    //         console.log(event)
    //         // var messages = document.getElementById('messages')
    //         // var message = document.createElement('li')
    //         // var content = document.createTextNode(event.data)
    //         // message.appendChild(content)
    //         // messages.appendChild(message)
    //     };
    //     return () => {
    //         ws.close()
    //     }
    // }, [])
    return <main>

        <h1>{id}</h1>
        <WebSocketDemo />
    </main>
}




export const WebSocketDemo = () => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, ] = useState('ws://localhost:8000/ws/');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const [questions, setQuestions] = useAtom(QuestionsAtom)
  const user_global = useAtomValue(UserGlobalAtom)

  const { id } = useParams()

  const answers_base_value_mutation = useMutation({
    mutationKey: ['question_answers', ],
    mutationFn: async () => {
        const response = await customFetch(`tornoment/get_all_questions/20/${id}`, {
            method: 'GET'
        })
        return response
    },
    onSuccess: (data) => {
        const respond_zod = QuestionAnswersZod.safeParse(data)
        if (respond_zod.success) {
          setQuestions(respond_zod.data)
          console.log(respond_zod.data)   
        }
        // else  add_answers_form.setValue('answers', data)
        toast({
            title: 'Answers loaded successfully',
        })
    }        
})
  const { sendMessage, lastMessage, readyState , } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  // const handleClickChangeSocketUrl = useCallback(
  //   () => setSocketUrl('ws://localhost:8000/ws/sendMessage'),
  //   []
  // );

  const handleClickSendMessage = useCallback(() => sendMessage(JSON.stringify({
    type: "ECHO",
    message: "Hello"
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), []);

  const handleClickSendBroadCast = useCallback(() => sendMessage(JSON.stringify({
    type: "BROADCAST",
    message: "xxx"
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button className="" onClick={() => answers_base_value_mutation.mutate()}>
        get all questions
      </button>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Click Me to send 'Hello'
      </button>

      <button
        onClick={handleClickSendBroadCast}
        disabled={readyState !== ReadyState.OPEN}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Click Me to send xxx as BROADCAST
      </button>
      <hr />
      {questions.map((question, ) => <div key={question.id}>
        <h1 className="text-4xl text-red-500">{question.title}</h1>
        {JSON.stringify(question.answerToQuestionInTor === null ? 'not answered' : 'answered')}
        <ul className={`flex gap-3
        ${question.answerToQuestionInTor === null ? 'bg-white' : 'bg-zinc-400'}`}>
          {question.answers.map((answer, ) => <li 
          key={answer.id}
          className={`bg-blue-100 p-2
          // ${question.answers.findIndex(i => i.answerToQuestionInTor !== null) !== -1 ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${question.answerToQuestionInTor?.answer_id === answer.id ? 'bg-red-500' : ''}`}
          onClick={() => {
            // check if the answer has not been answered
            //by the answerToQuestionInTor
            const answer_id = question.answerToQuestionInTor?.answer_id
            if (answer_id === null || answer_id === undefined) {
              // send answer to the server
              sendMessage(JSON.stringify({
                type: "SEND_ANSWER",
                id: parseInt(id ?? '0'),
                question: question.id,
                answer: answer.id,
                user_email: user_global?.user_email ?? localStorage.getItem('user_email') ?? 'anonymous',
              }))
              // save the answer to the question
              setQuestions(prev => {
                return prev.map(q => {
                  if (q.id === question.id) {
                    return {
                      ...q,
                      answerToQuestionInTor: {
                        answer_id: answer.id
                      }
                    }
                  }
                  return q
                
                })
              })
            }
            else {
              toast({
                title: 'You have already answered this question',
              })
            }
          }}>{answer.title}
          {answer.answerToQuestionInTor}
          </li>)}
        </ul>
      </div>)}
      <pre>
        <code>
          {JSON.stringify({ questions }, null, 2)}
        </code>
      </pre>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
};

