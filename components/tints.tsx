import {
  Button,
  ColorSelector,
  FormField,
  Rows,
  Text,
} from "@canva/app-ui-kit";
import { addElementAtPoint, initAppElement } from "@canva/design";
import { useEffect, useState } from "react";
import * as styles from "styles/components.css";
import chroma from "chroma-js";
import { useIntl } from "react-intl";

type AppElementData = {
  colors: string[];
};

const appElementClient = initAppElement<AppElementData>({
  render: (data) => [
    {
      type: "text",
      top: 0,
      left: 0,
      ...data,
      children: [],
    },
  ],
});

const TINT_LEVELS = [
  { label: 50, lightness: 95 },
  { label: 100, lightness: 90 },
  { label: 200, lightness: 80 },
  { label: 300, lightness: 70 },
  { label: 400, lightness: 60 },
  { label: 500, lightness: 50 }, // couleur de base
  { label: 600, lightness: 40 },
  { label: 700, lightness: 30 },
  { label: 800, lightness: 20 },
  { label: 900, lightness: 10 },
];

export const Tints = () => {
  const [baseColor, setBaseColor] = useState("#c9169f");
  const [tintColors, setTintColors] = useState<{label: number, hex: string}[]>([]);
  const { formatMessage } = useIntl();

  useEffect(() => {
    appElementClient.registerOnElementChange(() => {});
    generateTints(baseColor);
  }, []);

  const generateTints = (base: string) => {
    const baseHsl = chroma(base).hsl();
    const colors = TINT_LEVELS.map(({ label, lightness }) => ({
      label,
      hex: chroma.hsl(baseHsl[0], baseHsl[1], lightness/100).hex()
    }));
    setTintColors(colors);
  };

  const handleColorChange = (color: string) => {
    setBaseColor(color);
    generateTints(color);
  };

  const handleAddTints = () => {
    let left = 5;
    let top = 5;
    
    tintColors.forEach(({ hex }) => {
      addElementAtPoint({
        type: "shape",
        width: 40,
        height: 40,
        left,
        top,
        viewBox: { width: 100, height: 100, top: 0, left: 0 },
        paths: [
          {
            d: "M 0 0 H 100 V 100 H 0 Z",
            fill: { dropTarget: false, color: hex },
          },
        ],
        rotation: 0,
      });
      left += 45;
      if (left > 200) {
        left = 5;
        top += 45;
      }
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">

        <Text>
          {formatMessage({
            id: "description",
            defaultMessage: "Generate harmonious variations of your base color.",
          })}
        </Text>

        <FormField
          label={formatMessage({ id: "baseColorLabel", defaultMessage: "Base color" })}
          control={() => <ColorSelector color={baseColor} onChange={handleColorChange} />}
        />

        {/* Grille minimaliste 5 colonnes */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          padding: '16px 0'
        }}>
          {tintColors.map(({ hex }) => (
            <div 
              key={hex}
              style={{
                aspectRatio: '1/1',
                borderRadius: '6px',
                backgroundColor: hex,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            />
          ))}
        </div>

        <Button onClick={handleAddTints} variant="primary">
          {formatMessage({ id: "addTints", defaultMessage: "Add to design" })}
        </Button>
      </Rows>
    </div>
  );
};
