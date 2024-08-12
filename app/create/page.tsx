"use client";
import {
  generateAIEssay,
  getOneEssay,
  uploadEssay,
} from "@/backend/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import Answer from "../[id]/answer/page";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Create() {
  const [title, settitle] = useState("");
  const [currentNumber, setCurrentNumber] = useState(0);
  const [generateNumber, setgenerateNumber] = useState(5);
  const router = useRouter();
  const [questions, setQuestions]: any = useState([
    {
      text: "",
      answer: "",
      rejectedAnswer: [],
      acceptedAnswer: [],
    },
  ]);
  const [rules, setrules] = useState({
    internetSearch: true,
    sameAnswers: true,
  });
  const changeNumber = (number: number) => {
    setCurrentNumber(number);
  };

  const onChangeQuestion = (text: string) => {
    const newQuestion = [...questions];
    newQuestion[currentNumber].text = text;
    setQuestions(newQuestion);
  };
  const onChangeAnswer = (text: string) => {
    const newQuestion = [...questions];
    newQuestion[currentNumber].answer = text;
    setQuestions(newQuestion);
  };
  const newNumber = () => {
    setQuestions([
      ...questions,
      { text: "", answer: "", rejectedAnswer: [], acceptedAnswer: [] },
    ]);
    changeNumber(currentNumber + 1);
  };
  const deleteNumber = () => {
    changeNumber(currentNumber - 1);
    const newData = questions;
    newData.pop();
    setQuestions(newData);
  };
  const submitQuestion = async () => {
    const emptyQuestion =
      questions.filter((q: { text: string }) => q.text === "").length > 0 ||
      questions.filter((q: { answer: string }) => q.answer === "").length > 0;
    const emptyTitle = title === "";

    if (emptyQuestion) {
      console.error("one of question or answer is empty");
      toast({
        variant: "destructive",
        title: "one of question or answer is empty",
      });
    } else if (emptyTitle) {
      console.error("title is empty");
      toast({
        variant: "destructive",
        title: "title is empty",
      });
    } else {
      const response = await uploadEssay({ title, questions, rules });
      if (response.status === "ok") {
        router.push("/");
      } else {
        console.log(response);
      }
    }
  };

  const generateQuestions = async () => {
    const result = await generateAIEssay(title, generateNumber);
    console.log(result);
    setQuestions(result);
  };
  return (
    <TooltipProvider>
      <div className="p-4 space-y-4 responsive select-none">
        <div className="space-y-2">
          <p>title</p>
          <Input value={title} onChange={(e) => settitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <p>rules</p>
          <Card className="p-4 space-y-3">
            <div className="flex justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p>allow same answers</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-40 sm:w-60 md:w-80">
                    If enabled, answers that are more than 10 words, and are not
                    the same as the correct answer but are 100% the same as the
                    accepted answer, are considered cheating.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Switch
                checked={rules.sameAnswers}
                onCheckedChange={(e) => setrules({ ...rules, sameAnswers: e })}
              />
            </div>

            {/* <div className="flex justify-between">
            <p>allow answers from internet</p>
            <Switch checked={rules.internetSearch} onCheckedChange={(e)=>setrules({...rules,internetSearch:e})} />
          </div> */}
          </Card>
        </div>
        <Card className="p-4 space-y-2">
          <div className="space-x-2">
            <Badge>no. {currentNumber + 1}</Badge>
            <Badge>total : {questions.length}</Badge>
          </div>
          <p>question</p>
          <Input
            value={questions[currentNumber]?.text}
            onChange={(e) => onChangeQuestion(e.target.value)}
          />
          <p>answer and instruction</p>
          <Textarea
            rows={3}
            className="resize-none"
            value={questions[currentNumber]?.answer}
            onChange={(e) => onChangeAnswer(e.target.value)}
          />
          {title && questions.length <= 1 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger />
                <AccordionContent className="flex justify-between items-center">
                  <div className="grid sm:flex items-center gap-4 p-4">
                    <span>generate</span>
                    <Input
                      type="number"
                      className="sm:w-24 text-center"
                      min={0}
                      value={generateNumber}
                      onChange={(e) =>
                        setgenerateNumber(parseInt(e.target.value))
                      }
                    />
                    <span className="break-all">questions about {title}</span>
                  </div>
                  <Button onClick={generateQuestions}>Generate</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </Card>
        <div className="grid gap-2 grid-cols-2">
          <Button
            onClick={() => changeNumber(currentNumber - 1)}
            disabled={currentNumber === 0}
          >
            prev
          </Button>
          {currentNumber < questions.length - 1 ? (
            <Button
              onClick={() => {
                changeNumber(currentNumber + 1);
              }}
            >
              next
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={deleteNumber}
                disabled={questions.length <= 1}
                variant="destructive"
              >
                Delete
              </Button>
              <Button
                onClick={newNumber}
                disabled={
                  questions[currentNumber]?.text === "" ||
                  questions[currentNumber]?.answer === ""
                }
              >
                new
              </Button>
            </div>
          )}
        </div>
        <Button className="w-full" onClick={submitQuestion}>
          submit
        </Button>
      </div>
    </TooltipProvider>
  );
}
