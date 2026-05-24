"use server";

import { db } from "@/firebase/admin";
import { generateObject } from "ai";

import { google } from "@ai-sdk/google";
import { feedbackSchema, interviewTemplates } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";

export async function getInterviewsByUserId(
  userId: string,
): Promise<Interview[] | null> {
  if (!userId) return [];
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

    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `Eres un entrevistador de IA que analiza una entrevista simulada. Tu tarea es evaluar al candidato basándote en categorías estructuradas. Sé minucioso y detallado en tu análisis. No seas indulgente con el candidato. Si hay errores o áreas de mejora, señálalos.
        Transcripción:
        ${formattedTranscript}

        Por favor, califica al candidato de 0 a 100 en las siguientes áreas. No agregues categorías distintas a las proporcionadas, y asegúrate de que todos los nombres de categorías, comentarios, fortalezas, áreas de mejora y la evaluación final estén escritos en español:
        - **Habilidades de Comunicación**: Claridad, articulación, respuestas estructuradas.
        - **Conocimiento Técnico**: Comprensión de conceptos clave para el puesto.
        - **Resolución de Problemas**: Capacidad para analizar problemas y proponer soluciones.
        - **Ajuste Cultural y al Puesto**: Alineación con los valores de la empresa y el rol del puesto.
        - **Confianza y Claridad**: Confianza en las respuestas, compromiso y claridad.
        `,
      system:
        "Eres un entrevistador profesional que analiza una entrevista simulada. Tu tarea es evaluar al candidato basándote en categorías estructuradas.",
    });

    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (e: any) {
    console.error("Error saving feedback:", e?.message || e);
    console.error("Cause:", e?.cause);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedbackQuery = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .get();

  if (feedbackQuery.empty) return null;

  const feedbackDocs = feedbackQuery.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];

  feedbackDocs.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return feedbackDocs[0];
}

export async function createInterviewFromTemplate(
  templateId: string,
  userId: string,
): Promise<string | null> {
  try {
    const template = interviewTemplates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const newInterview = {
      role: template.role,
      level: template.level,
      type: template.type,
      techstack: template.techstack,
      questions: template.questions,
      userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(newInterview);
    return docRef.id;
  } catch (error) {
    console.error("Error creating interview from template:", error);
    return null;
  }
}
