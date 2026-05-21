"use server";

import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";

export async function getInterviewsByUserId(
  userId: string,
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams,
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`,
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        Eres un entrevistador de IA que analiza una entrevista simulada. Tu tarea es evaluar al candidato según categorías estructuradas. Sé detallado y preciso en tu análisis. No seas indulgente con el candidato. Si hay errores o áreas de mejora, señálalos.
        Transcripción:
        ${formattedTranscript}

        Califica al candidato de 0 a 100 en las siguientes áreas. No añadas categorías fuera de las provistas:
        - **Habilidades de comunicación**: Claridad, articulación, respuestas estructuradas.
        - **Conocimientos técnicos**: Comprensión de los conceptos clave del puesto.
        - **Resolución de problemas**: Capacidad para analizar problemas y proponer soluciones.
        - **Ajuste cultural y de rol**: Alineación con los valores de la empresa y el puesto.
        - **Confianza y claridad**: Seguridad en las respuestas, compromiso y claridad.

        Devuelve la evaluación en español, manteniendo los nombres de las categorías tal como aparecen arriba.
        `,
      system:
        "Eres un entrevistador profesional que analiza una entrevista simulada. Tu tarea es evaluar al candidato según categorías estructuradas",
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const newFeedback = await db.collection("feedback").add(feedback);

    return { success: true, feedbackId: newFeedback.id };
  } catch (e) {
    console.log("Error saving feedback", e);

    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;
  const feedbackDoc = feedback.docs[0];

  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}
