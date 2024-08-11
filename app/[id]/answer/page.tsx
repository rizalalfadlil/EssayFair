"use client";
import { checkScore, getOneQuestions } from "@/backend/questions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { title } from "process";
import React, { useEffect, useState } from "react";

export default function Answer({ params }: any) {
  const router = useRouter()
  const [name, setname] = useState("");
  const [data, setdata]: any = useState({
    title: (
      <span className="flex gap-2 items-center text-muted-foreground">
        <LoaderCircle className="animate-spin" size={16} strokeWidth={2} />
        wait...
      </span>
    ),
  });
  const [questions, setquestions]: any = useState([
    {
      text: (
        <span className="flex gap-2 items-center text-muted-foreground">
          <LoaderCircle className="animate-spin" size={16} strokeWidth={2} />
          wait...
        </span>
      ),
    },
  ]);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [answers, setanswers]: any = useState([]);
  const [finished, setFinished] = useState(false);
  const [result, setresult]: any = useState(null);
  const [waitResult, setwaitResult] = useState(false);

  useEffect(() => {
    getQuestions();
    getLocalName()
  }, []);

  const getLocalName = async() => { 
    const localName = await localStorage.getItem("name")
    if(localName){
      setname(localName)
    }else{
      router.push("/")
    }
   }

  const getQuestions = async () => {
    const response: any = await getOneQuestions(params.id);
    console.log("data", response);
    setdata(response);
    setquestions(response.questions);
    setanswers(
      response.questions.map((q: { text: any }) => ({
        text: q.text,
        answer: "",
      }))
    );
  };

  const changeNumber = (number: number) => {
    setCurrentNumber(number);
  };
  const onChangeInputText = (text: string) => {
    const newAnswer = [...answers];
    newAnswer[currentNumber].answer = text;
    setanswers(newAnswer);
  };
  const onFinish = async () => {
    setwaitResult(true)
    const res = await checkScore(answers, params.id, name);
    setresult(res);
    setFinished(true);
  };
  const emptyExist = () => {
    const emptyAnswer = answers.filter((a: { answer: string; }) => a.answer === "");
    return emptyAnswer.length !== 0;
  };
  return !finished ? (
    <div className="p-4 space-y-4 responsive">
      <p className="text-xs">name : {name}</p>
      <h2>{data?.title}</h2>
      <Card className="p-4 space-y-2 h-40">
        <Badge>{currentNumber + 1 + " of " + questions.length}</Badge>
        <p>{questions[currentNumber]?.text}</p>
        <Input
          placeholder="answer"
          value={answers[currentNumber]?.answer}
          onChange={(e) => onChangeInputText(e.target.value)}
        />
      </Card>
      <div className="grid gap-4">
        <Button
          onClick={() => changeNumber(currentNumber - 1)}
          disabled={currentNumber < 1}
        >
          prev
        </Button>
        {currentNumber !== questions.length - 1 ? (
          <Button
            onClick={() => {
              currentNumber < questions.length - 1 &&
                changeNumber(currentNumber + 1);
            }}
          >
            next
          </Button>
        ) : (
          <Button
            onClick={onFinish}
            disabled={emptyExist() || waitResult}
          >
            {waitResult?"Loading":"Finish"}
          </Button>
        )}
      </div>
    </div>
  ) : (
    <div className="grid p-4 responsive content-center h-screen space-y-4">
      <Card className="p-4 space-y-4">
        <CardTitle>All done</CardTitle>
        <Badge>
          {result?.correct + " / " + result?.question} correct answer
        </Badge>
        <p className="text-xl bg-primary text-primary-foreground p-2 rounded-lg text-center font-semibold">
          {result?.score}
        </p>

        <Button
          className="w-full"
          onClick={() => router.push(`/${params.id}/score`)}
        >
          See Leaderboard
        </Button>
      </Card>
      <Card className="p-4">
        result
        <ScrollArea className="h-80">
          {result?.answers.map((a: { correct: any; question: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; answer: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; reason: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, i: any) => (
            <Alert
              variant={a.correct ? "default" : "destructive"}
              className="my-2"
            >
              {a.correct ? <Check /> : <X />}
              <AlertDescription>{a.question}</AlertDescription>
              <AlertTitle>{a.answer}</AlertTitle>
              <AlertDescription>{a.reason}</AlertDescription>
            </Alert>
          ))}
        </ScrollArea>
      </Card>
    </div>
  );
}
