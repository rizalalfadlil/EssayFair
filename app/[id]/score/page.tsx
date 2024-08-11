"use client";
import { getScoreList } from "@/backend/questions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import React, { Key, useEffect, useState } from "react";

export default function Page({ params }: any) {
  const [data, setdata]: any = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const result = await getScoreList(params.id);
    setdata(result.sort((a, b) => b.score - a.score));
    console.log(result);
  };
  return (
    <div className="p-4 space-y-4 responsive h-screen flex flex-col">
      <h1>Scoreboard</h1>
      <ScrollArea className="space-y-2 grow">
        {data.map((d: { name: string; score: number | string }, i: number) => (
          <Card key={i} className="p-4 my-2 grid grid-cols-4 items-center">
            <span className="w-fit">{i + 1}</span>
            <span>{d.name}</span>
            <Badge className="w-fit">{d.score}</Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => console.log(d.answers)}>view</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>{d.name} results</DialogTitle>
                <ScrollArea className="h-64">
                  {d.answers.map((a, i) => (
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
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
