import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

const Page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = Boolean(userInterviews?.length);
  const hasUpcomingInterviews = Boolean(latestInterviews?.length);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>
            Prepárate para entrevistas con práctica y feedback impulsados por IA
          </h2>
          <p className="text-lg">
            Practica con preguntas reales de entrevista y recibe
            retroalimentación instantánea
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Iniciar entrevista</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Tus entrevistas</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>Aún no has realizado ninguna entrevista</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Realiza una entrevista</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>No hay nuevas entrevistas disponibles</p>
          )}
        </div>
      </section>
    </>
  );
};
export default Page;
