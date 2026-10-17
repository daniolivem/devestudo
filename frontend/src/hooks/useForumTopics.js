import { useState } from "react";
import { initialForumTopics } from "../services/forumService";

export function useForumTopics() {
  const [topics, setTopics] = useState(initialForumTopics);

  function createTopic(topic) {
    setTopics((currentTopics) => [topic, ...currentTopics]);
  }

  function updateTopic(originalTitle, topicChanges) {
    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.title === originalTitle ? { ...topic, ...topicChanges, lastInteractionHours: 0 } : topic,
      ),
    );
  }

  function deleteTopic(topicTitle) {
    setTopics((currentTopics) => currentTopics.filter((topic) => topic.title !== topicTitle));
  }

  function upvoteTopic(topicTitle) {
    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.title === topicTitle && !topic.hasVoted ? { ...topic, votes: topic.votes + 1, hasVoted: true } : topic,
      ),
    );
  }

  return {
    topics,
    createTopic,
    updateTopic,
    deleteTopic,
    upvoteTopic,
  };
}
