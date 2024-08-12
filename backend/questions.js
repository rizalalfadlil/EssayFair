import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const qCollection = collection(db, "q");
const data = [
  {
    id: "1",
    title: "random",
    questions: [
      {
        text: "Apa ibu kota Indonesia?",
        answer: "Jakarta",
      },
      {
        text: "Siapakah penemu lampu pijar?",
      },
      {
        text: "Berapa jumlah planet dalam tata surya kita?",
        answer: "8",
      },
    ],
  },
];

export const getEssay = async () => {
  const qDocs = await getDocs(qCollection);
  const questions = qDocs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return questions;
};
export const getOneEssay = async (id) => {
  const qRef = doc(db, "q", id);
  const qDoc = await getDoc(qRef);
  const data = { ...qDoc.data(), id: qDoc.id };
  return data;
};
export const uploadEssay = async (data) => {
  try {
    const response = await addDoc(qCollection, data);
    return { status: "ok", message: response };
  } catch (e) {
    return { status: "error", message: e };
  }
};
export const checkScore = async (answers, id, name) => {
  const qRef = doc(db, "q", id);
  const qDoc = await getDoc(qRef);
  const questions = qDoc.data().questions;

  const data = answers.map((a, i) => ({
    question: a.text,
    correctAnswer: questions[i].answer,
    rejectedAnswer: [],
    acceptedAnswer: [],
    answer: a.answer,
  }));

  const AIResponse = await getAIAnswer(data, qDoc.data().rules);

  const correctAnswer = AIResponse.filter((c) => c.correct === true).map(
    (d) => d.answer
  );
  const falseAnswer = AIResponse.filter((c) => c.correct === false).map(
    (d) => d.answer
  );

  const newQuestion = questions.map((q, i) => ({
    ...q,
    acceptedAnswer: AIResponse[i].correct
      ? [...q.acceptedAnswer, AIResponse[i].answer]
      : q.acceptedAnswer,
    rejectedAnswer: AIResponse[i].correct
      ? q.rejectedAnswer
      : [...q.rejectedAnswer, AIResponse[i].answer],
  }));

  const scoreData = {
    name,
    score: ((correctAnswer.length / AIResponse.length) * 100).toFixed(1),
    question: AIResponse.length,
    correct: correctAnswer.length,
    answers: AIResponse,
    date: new Date(),
  };

  setScore(scoreData, id);

  updateQuestion(id, newQuestion);

  return scoreData;
};
const setScore = async (data, id) => {
  const qCollection = collection(db, `q/${id}/score`);
  await addDoc(qCollection, data);
  console.log(data);
};

export const getScoreList = async (id) => {
  const sDoc = collection(db, `q/${id}/score`);
  const sRef = await getDocs(sDoc);
  const data = sRef.docs.map((d) => d.data());
  return data;
};
const updateQuestion = async (id, newData) => {
  const qRef = doc(db, "q", id);
  const qDoc = await getDoc(qRef);
  const data = qDoc.data();

  const updatedData = { ...data, questions: newData };
  await updateDoc(qRef, updatedData);
};

export const deleteEssay = async (id) =>{
  const qRef = doc(db, "q", id);
  await deleteDoc(qRef);
}

const getAIAnswer = async (data, rules) => {
  const instruction = `determine whether the answer is wrong or right from the given json data.

  "question" is a question.
  "correctAnswer" is the answer key or rule for the correct answer, By default, if the answer is the same or similar to the correct answer even with typos or additional words as long as it does not conflict with existing rules, the answer is counted as correct.
  "acceptedAnswer" and "rejectedAnswer" are answers that you have previously rated, I added them so that you can rate them fairly.
  "answer" is an answer that will be determined whether it is true or false. ${
    rules.sameAnswers
      ? ""
      : "same answer is : not allowed, If the answer is more than 10 words, and is not the same as the correct answer but is 100% the same as the accepted answer, then the answer is considered wrong because it is a cheat result."
  }
  
  answer with json in {question(string),answer(string), correct(boolean), reason(string, reason why the answer is wrong, optional)}
  example: {question:"what is the name of the capital of Indonesia", answer:"jakarta",correct:false,reason:"not started with capital letter"}
  
  `;

  const prompt = `${instruction}
  ${JSON.stringify(data)}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return JSON.parse(text);
};

export const generateAIEssay = async (title, numbers) => {
  const instruction = `answer in the form of an array of objects (json) with the format: text(string, question), answer(string, containing the answer or criteria for the correct answer), acceptedAnswer: (empty array), rejectedAnswer: (empty array)

  - for "answer" you can fill in a definite answer such as
  q: "In which country is the island of Java located?"
  a: "Indonesia"
  - or answers that can vary like
  q: "Name at least 3 Southeast Asian countries that you know!"
  a: "3 or more of the following countries: Brunei Darussalam, Indonesia, Cambodia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand and Vietnam"
  - can also be used to provide rules such as
  q: "what's your name?"
  a: "all people's names are allowed, as long as they start with an introductory sentence such as my name is, my name is, etc., also pay attention to the capital letters"
  q: "write down a mathematical operation whose result is equal to 25 + 25"
  a: "mathematical operations that produce 50, except those that don't change anything like 50 + 0
  - if the answer is a definite answer, and there are no rules, be as short as possible`;

  const prompt = `generate ${numbers} questions about ${title}`;
  const result = await model.generateContent(`${instruction} \n ${prompt}`);
  const response = await result.response;
  const text = response.text();
  return JSON.parse(text);
};
