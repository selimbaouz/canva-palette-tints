import {
  Button,
  ColorSelector,
  FormField,
  Rows,
  ReloadIcon,
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

export const Palette = () => {
  const [baseColor, setBaseColor] = useState("#ffb6b6");
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const { formatMessage } = useIntl();

  useEffect(() => {
    appElementClient.registerOnElementChange(() => {});
    generatePalette("#ffb6b6");
  }, []);

  const generatePalette = (base: string) => {
    const colors: string[] = [base];
    while (colors.length < 5) {
      const newColor = chroma(base)
        .set("hsl.h", Math.random() * 360)
        .brighten(Math.random())
        .hex();
      if (!colors.includes(newColor) && chroma.valid(newColor)) {
        colors.push(newColor);
      }
    }
    setPaletteColors(colors);
  };

  const handleColorChange = (color: string) => {
    setBaseColor(color);
    generatePalette(color);
  };

  const handleReload = () => {
    generatePalette(baseColor);
  };

  const handleAddPalette = () => {
    const left = 5;
    let top = 5;

    paletteColors.forEach((color) => {
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
            fill: { dropTarget: false, color },
          },
        ],
        rotation: 0,
      });
      top += 40;
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">

        <Text>
          {formatMessage({
            id: "description",
            defaultMessage: "Create a vibrant color palette from a base color",
          })}
        </Text>

        <FormField
          label={formatMessage({
            id: "baseColorLabel",
            defaultMessage: "Base color",
          })}
          control={() => (
            <ColorSelector color={baseColor} onChange={handleColorChange} />
          )}
        />


        {/* Display Palette */}
        <div style={{
          display: "flex", 
          justifyContent: "center", 
          margin: "2rem 0"
        }}>
          {paletteColors.map((color, index) => (
            <div key={index} style={{
              width: "60px",
                height: "60px",
                backgroundColor: color,
            }}>
              {/* Empty content, just a colored square */}
            </div>
          ))}
        </div>

        <Button onClick={handleReload} icon={ReloadIcon} variant="secondary">
          {formatMessage({ id: "reload", defaultMessage: "Shuffle colors" })}
        </Button>
        <Button onClick={handleAddPalette} variant="primary">
          {formatMessage({
            id: "generatePalette",
            defaultMessage: "Add to design",
          })}
        </Button>
      </Rows>
    </div>
  );
};
