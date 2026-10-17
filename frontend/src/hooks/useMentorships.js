import { useState } from "react";
import { initialMentorships } from "../services/mentorshipService";

export function useMentorships() {
  const [mentorships, setMentorships] = useState(initialMentorships);

  function requestMentorship(mentor) {
    setMentorships((currentMentorships) => [
      {
        mentorName: mentor.name,
        role: mentor.role,
        status: "REQUESTED",
        channel: mentor.channel,
        availability: mentor.availability,
        format: mentor.format,
      },
      ...currentMentorships,
    ]);
  }

  return { mentorships, requestMentorship };
}
