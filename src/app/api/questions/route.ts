import { auth } from "@/auth";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
export async function POST(req: Request, res: Response) {
  const session = await auth();

  const body = await req.json();
  try {
    const { amount, topic } = quizCreationSchema.parse(body);
    const chatSession = model.startChat({
      generationConfig,
      // history: [
      //   {
      //     role: "user",
      //     parts: [
      //       {
      //         text: `You are to generate a random hard mcq question about ${topic} , ${amount} times`,
      //       },
      //     ],
      //   },
      //   {
      //     role: "system",
      //     parts: [
      //       {
      //         text:
      //           "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array" +
      //           `
      //           if is it asked to generate question 3 times then there should be an array of objects where each object is of the following output format -

      //         {
      //   question: "question",
      //   answer: "answer with max length of 15 words",
      //   option1: "option1 with max length of 15 words",
      //   option2: "option2 with max length of 15 words",
      //   option3: "option3 with max length of 15 words",
      // }
      //         `,
      //       },
      //     ],
      //   },
      // ],
      history: [],
    });
    const prompt = `
        You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array,
        You are to generate a random hard mcq question about ${topic} , ${amount} times,
        if is it asked to generate question 3 times then there should be an array of objects where each object should be of the object structure give below and strictly give a response which when passed under JSON.parse() , should not give any error:-
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
        Make sure to properly escape any characters that could invalidate the JSON format, such as quotes inside strings, and errors are like these SyntaxError: Expected ',' or '}' after property value in JSON do not occur. 
`;
    const result = await chatSession.sendMessage(prompt);
    let resi = result.response.text().replace(/'/g, '"');
    resi = resi.replace(/(\w)"(\w)/g, "$1'$2");

    resi = resi
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // console.log("naya reiessssss\n", resi);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(resi);
      console.log("yeh hai json wala\n", parsedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "An error occurred while parsing the AI response." },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        questions: parsedResponse,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("elle gpt error", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}
