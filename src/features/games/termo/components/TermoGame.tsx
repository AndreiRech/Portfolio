"use client";
import { useSearchParams } from "next/navigation";
import { MODES, type TermoMode } from "../model/modes";
import ClassicTermoGame from "./ClassicTermoGame";
import VariantTermoGame from "./VariantTermoGame";
export default function TermoGame() {
  const params = useSearchParams();
  const mode: TermoMode =
    MODES.find((value) => value === params.get("mode")) ?? "classic";
  return mode === "classic" ? (
    <ClassicTermoGame />
  ) : (
    <VariantTermoGame key={mode} mode={mode} />
  );
}
