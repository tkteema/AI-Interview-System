import React, { act, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({ activeQuestionIndex, mockInterViewQuestion, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { error, isRecording, results, startSpeechToText, stopSpeechToText, setResults } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // Update userAnswer with the transcripts
  useEffect(() => {
    if (results.length > 0) {
      setUserAnswer((prevAns) => prevAns + results.map((r) => r.transcript).join(" "));
      setResults([]);  // Reset the results after processing
    }
  }, [results]);

  // Call the UpdateUserAnswerInDb function when recording stops and answer length is valid
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswerInDb();
    }
  }, [isRecording, userAnswer]);

  const test = () => {
    console.log(mockInterViewQuestion["interviewQuestions"][activeQuestionIndex]);
  }
  // Function to update user answer in the database and get feedback
  const UpdateUserAnswerInDb = async () => {
    try {
      setLoading(true);
  
      // Ensure you are correctly accessing the interview question data
      const currentQuestion = mockInterViewQuestion?.interviewQuestions[activeQuestionIndex];
      
      if (!currentQuestion || !currentQuestion.question) {
        toast("Error: Question is missing.");
        setLoading(false);
        return;
      }
  
      // Proceed with feedback request and database insert
      const feedbackPrompt = `Question: ${currentQuestion?.question}, User Answer: ${userAnswer}. Please provide feedback in JSON format with the following structure: { "rating": <rating from 1 to 10>, "feedback": <feedback string> }. Return only the JSON object, nothing else.`;
  
      const result = await chatSession.sendMessage(feedbackPrompt);
      const rawResponse = await result.response.text();
  
      // Remove code formatting and sanitize the JSON response
      const jsonString = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim(); // Remove any unnecessary spaces or formatting
  
      const JsonFeedbackResp = JSON.parse(jsonString);
  
      // Insert answer into the database
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: currentQuestion?.question, // Ensure question is not null
        correctAns: currentQuestion?.answerExample,  // Assuming you want to store answerExample here
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback || "No feedback provided",
        rating: JsonFeedbackResp?.rating || 0,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      });
  
      if (resp) {
        toast("User Answer recorded successfully!");
        setUserAnswer("");  // Reset userAnswer after submission
      }
    } catch (error) {
      console.error("Error saving user answer:", error);
      toast("An error occurred while saving your answer.");
    } finally {
      setResults([]);
      setLoading(false);
    }
  };
  
  
  // Start or stop the recording based on the current state
  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="relative flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Webcam mirrored={true} style={{ height: "50vh", width: "100%" }} />
      </div>
      <Button onClick={test}></Button>
      <Button disabled={loading} variant="outline" onClick={StartStopRecording} className="my-10">
        {isRecording ? (
          <h2 className="flex items-center justify-center text-red-600 gap-2">
            <StopCircle />
            Recording...
          </h2>
        ) : (
          <h2 className="flex items-center justify-center gap-2">
            <Mic />
            Start Recording
          </h2>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
