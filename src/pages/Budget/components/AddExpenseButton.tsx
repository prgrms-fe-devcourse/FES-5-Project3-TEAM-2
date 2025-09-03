import Button from "@/components/common/Button";
import CardIcon from "@/assets/icons/card.svg?react";
import { useState } from "react";
import AddExpenseModal from "@/pages/Budget/components/AddExpenseModal";

export default function AddExpenseButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="primary"
        startIcon={<CardIcon className="w-4 h-4" />}
        onClick={() => setOpen(true)}
      >
        경비 추가
      </Button>
      {open && <AddExpenseModal onClose={() => setOpen(false)} />}
    </>
  );
}
