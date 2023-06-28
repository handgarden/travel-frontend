import { useState } from "react";

const useModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  return { isModalOpen, setIsModalOpen, handleCancel, showModal };
};

export default useModalState;
