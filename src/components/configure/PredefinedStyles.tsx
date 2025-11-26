"use client";

import { useState } from "react";
import PlayIcon from "@/icons/PlayIcon";
import { getConfigSummary } from "@/lib/configure/utils";
import { PredefinedStylesProps } from "@/types/configure";

import { ButtonLegacy, CardContainer } from "@/components/ui";

export const PredefinedStyles = ({
  styles,
  onSelectStyle,
  onStartTimer,
}: PredefinedStylesProps) => {
  return (
    <CardContainer>
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Predefined Styles</h2>

        {/* Styles list */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              onSelect={() => onSelectStyle(style)}
              onStart={() => onStartTimer(style.config)}
            />
          ))}
        </div>
      </div>
    </CardContainer>
  );
};

interface StyleCardProps {
  style: PredefinedStylesProps["styles"][0];
  onSelect: () => void;
  onStart: () => void;
}

const StyleCard = ({ style, onSelect, onStart }: StyleCardProps) => {
  const handleCardClick = () => {
    onSelect();
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart();
  };

  return (
    <div
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{style.name}</h3>
          {style.isBuiltIn && (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">Built-in</span>
          )}
        </div>
        <p className="mb-2 text-sm text-gray-600">{style.description}</p>
        <p className="text-xs text-gray-500">{getConfigSummary(style.config)}</p>
      </div>

      <div className="flex items-center justify-between">
        <ButtonLegacy size="sm" onClick={handleStartClick} className="flex items-center gap-2">
          <PlayIcon className="h-4 w-4" />
          Start
        </ButtonLegacy>
      </div>
    </div>
  );
};
