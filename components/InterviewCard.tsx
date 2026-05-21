import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  id,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && id
      ? await getFeedbackByInterviewId({ interviewId: id, userId })
      : null;
  const normalizeType = (value: string) => {
    if (/mix|combinada|mixed/gi.test(value)) return "Mixta";
    if (/tech|técnica/gi.test(value)) return "Técnica";
    if (/conduct|conductual/gi.test(value)) return "Conductual";
    if (/cultural|fit/gi.test(value)) return "Ajuste cultural";
    return value;
  };
  const normalizedType = normalizeType(type);
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now(),
  ).format("DD/MM/YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>

          <Image
            src={getRandomInterviewCover()}
            alt="imagen de portada"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          <h3 className="mt-5 capitalize">Entrevista de {role}</h3>

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                alt="calendario"
                width={22}
                height={22}
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="estrella" width={22} height={22} />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "Aún no has realizado esta entrevista. Hazla ahora para mejorar tus habilidades."}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary">
            <Link
              href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}
            >
              {feedback ? "Ver retroalimentación" : "Ver entrevista"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default InterviewCard;
