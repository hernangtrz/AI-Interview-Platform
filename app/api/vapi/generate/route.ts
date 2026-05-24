import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, role, level, techstack, amount, userid, userId } = body;
  const finalUserId = userid || userId || "user_unknown";

  try {
    const { text: questions } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      prompt: `Prepara preguntas para una entrevista de trabajo.
        El rol de el trabajo es ${role}.
        El nivel de experiencia es ${level}.
        El stack tecnológico utilizado en el trabajo es: ${techstack}.
        El enfoque entre preguntas comportamentales y técnicas debe inclinarse hacia: ${type}.
        La cantidad de preguntas requeridas es: ${amount}.
        Por favor, devuelve solo las preguntas, sin ningún texto adicional.
        Las preguntas van a ser leídas por un asistente de voz, por lo tanto, no uses "/" o "*" o cualquier otro carácter especial que pueda romper al asistente de voz.
        Devuelve las preguntas formateadas como esta:
        ["Pregunta 1", "Pregunta 2", "Pregunta 3"]

        ¡Gracias!
    `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    console.log(error.message);
    console.log(error.cause);

    return Response.json(
      {
        success: false,
        message: error.message,
        error,
      },
      { status: 500 },
    );
  }
}
