import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import { interviewTemplates } from "@/constants";

const Page = async () => {
  const user = await getCurrentUser();

  const userInterviews = await getInterviewsByUserId(user?.id!);

  const hasPastInterviews = userInterviews && userInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Prepárate para tus entrevistas con práctica y retroalimentación impulsada por IA</h2>
          <p className="text-lg">
            Practica con preguntas reales de entrevistas y obtén retroalimentación instantánea
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Iniciar una entrevista</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
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
        <h2>Plantillas de entrevistas</h2>

        <div className="interviews-section">
          {interviewTemplates.map((template) => (
            <InterviewCard
              {...template}
              key={template.id}
              isTemplate={true}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </section>
    </>
  );
};
export default Page;
