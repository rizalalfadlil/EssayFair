"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Key, useEffect, useState } from "react";
import { getQuestions } from "@/backend/questions";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function Home() {
  const [questions, setquestions]: any = useState([]);
  const [name, setname] = useState("");
  const [loading, setloading] = useState(true);
  const [buttonLoading, setbuttonLoading] = useState(false)
  const router = useRouter();
  useEffect(() => {
    getQuestionsData();
    localStorage.removeItem("name");
  },[]);
  const getQuestionsData = async () => {
    try {
      const data = await getQuestions();
      setquestions(data);
      setloading(false);
    } catch (e) {
      console.log(e);
    }
  };
  const onStart = async (id: string) => {
    localStorage.setItem("name", name);
    setbuttonLoading(true)
    setTimeout(() => {
      router.push(`/${id}/answer`);
    }, 1000);
  };

  return (
    <main className="p-4 h-screen space-y-4 flex flex-col responsive">
      <p>create new subject</p>
      <Button onClick={() => router.push("/create")}>create</Button>
      <p className="text-xs">or</p>
      <p>answer existing subjects</p>
      <ScrollArea className="grow">
        <div className="grid gap-2">
          {loading ? (
            <Card className="p-4 select-none  transition-all flex flex-row gap-2 justify-between">
              <div className="bg-muted rounded-lg grow" />
              <div className="bg-muted rounded-lg w-10 p-2">
                <LoaderCircle className="animate-spin" />
              </div>
            </Card>
          ) : (
            questions.map(
              (q: { title: string; id: string; questions: any }, i: Key) => (
                <Dialog key={i}>
                  <DialogTrigger>
                    <Card className="p-4 select-none cursor-pointer hover:bg-muted/90 transition-all flex gap-2 justify-between">
                      <CardTitle>{q.title}</CardTitle>
                      <Badge>{q.questions.length} questions</Badge>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Enter your name</DialogTitle>
                    <Input
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                    />
                    <Button
                      onClick={() => onStart(q.id)}
                      disabled={name === "" || buttonLoading}
                    >
                      {buttonLoading?(<LoaderCircle className="animate-spin"/>):"Start"}
                    </Button>
                    <Button variant="secondary" onClick={()=>router.push(`${q.id}/score`)}>View Scoreboard</Button>
                  </DialogContent>
                </Dialog>
              )
            )
          )}
        </div>
      </ScrollArea>
    </main>
  );
}
