import { useState } from "react";
import { initialGroups } from "../services/groupService";

export function useGroups({ isMentor = false } = {}) {
  const [groups, setGroups] = useState(initialGroups);

  function saveGroup(payload, editingGroup = null) {
    const savedGroup = {
      title: payload.title,
      members: editingGroup?.members || 0,
      time: payload.time || "A definir",
      description: payload.description,
      tags: [payload.technology || "Geral", payload.level || "Aberto"],
      createdByCurrentMentor: isMentor || Boolean(editingGroup?.createdByCurrentMentor),
    };

    setGroups((currentGroups) => {
      if (!payload.originalTitle) {
        return [savedGroup, ...currentGroups];
      }

      return currentGroups.map((group) => (group.title === payload.originalTitle ? savedGroup : group));
    });
  }

  function deleteGroup(groupTitle) {
    setGroups((currentGroups) => currentGroups.filter((group) => group.title !== groupTitle));
  }

  return { groups, saveGroup, deleteGroup };
}
