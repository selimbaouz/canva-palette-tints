import {
  Button,
  Rows,
  ReloadIcon,
  Text,
  Swatch,
  SegmentedControl,
} from "@canva/app-ui-kit";
import { useEffect, useState } from "react";
import { addElementAtPoint, initAppElement } from "@canva/design";
import * as styles from "styles/components.css";
import chroma from "chroma-js";
import { useIntl } from "react-intl";
import { openColorSelector } from "@canva/asset";

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

export const App = () => {
  const [activeTab, setActiveTab] = useState<"palette" | "tints">("palette");
  const [baseColor, setBaseColor] = useState("#ffb6b6");
  const [tintColors, setTintColors] = useState<
    { label: number; hex: string }[]
  >([]);
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const { formatMessage } = useIntl();

  useEffect(() => {
    appElementClient.registerOnElementChange(() => {});
    generateTints(baseColor);
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

  const generateTints = (base: string) => {
    const baseHsl = chroma(base).hsl();
    const colors = TINT_LEVELS.map(({ label, lightness }) => ({
      label,
      hex: chroma.hsl(baseHsl[0], baseHsl[1], lightness / 100).hex(),
    }));
    setTintColors(colors);
  };

  const handleColorChange = (color: string) => {
    setBaseColor(color);
    generateTints(color);
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

  const Palette = () => (
    <>
      <Text>
        {formatMessage({
          id: "description_palette",
          defaultMessage: "Create a color palette from a base color",
        })}
      </Text>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Text variant="bold">
          {formatMessage({
            id: "baseColorLabel",
            defaultMessage: "Base color",
          })}
        </Text>

        <Swatch
          fill={[baseColor]}
          onClick={async (event) => {
            const anchor = event.currentTarget.getBoundingClientRect();
            await openColorSelector(anchor, {
              scopes: ["solid"],
              selectedColor: baseColor
                ? {
                    type: "solid",
                    hexString: baseColor,
                  }
                : undefined,
              onColorSelect: (event) => {
                if (event.selection.type === "solid") {
                  handleColorChange(event.selection.hexString as string);
                }
              },
            });
          }}
        />
      </div>

      {/* <FormField
          label={formatMessage({
            id: "baseColorLabel",
            defaultMessage: "Base color",
          })}
          control={() => (
            <ColorSelector color={baseColor} onChange={handleColorChange} />
          )}
        /> */}

      {/* Display Palette */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {paletteColors.map((color, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              height: "60px",
              backgroundColor: color,
            }}
          >
            {/* Empty content, just a colored square */}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Button onClick={handleReload} icon={ReloadIcon} variant="secondary">
          {formatMessage({ id: "reload", defaultMessage: "Shuffle colors" })}
        </Button>
        <Button onClick={handleAddPalette} variant="primary">
          {formatMessage({
            id: "addtoDesign",
            defaultMessage: "Add to design",
          })}
        </Button>
      </div>
    </>
  );

  const Tints = () => (
    <>
      <Text>
        {formatMessage({
          id: "description_tints",
          defaultMessage: "Generate harmonious tints from your base color",
        })}
      </Text>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Text variant="bold">
          {formatMessage({
            id: "baseColorLabel",
            defaultMessage: "Base color",
          })}
        </Text>

        <Swatch
          fill={[baseColor]}
          onClick={async (event) => {
            const anchor = event.currentTarget.getBoundingClientRect();
            await openColorSelector(anchor, {
              scopes: ["solid"],
              selectedColor: baseColor
                ? {
                    type: "solid",
                    hexString: baseColor,
                  }
                : undefined,
              onColorSelect: (event) => {
                if (event.selection.type === "solid") {
                  handleColorChange(event.selection.hexString as string);
                }
              },
            });
          }}
        />
      </div>

      {/* Grille minimaliste 5 colonnes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
        }}
      >
        {tintColors.map(({ hex }) => (
          <div
            key={hex}
            style={{
              aspectRatio: "1/1",
              borderRadius: "6px",
              backgroundColor: hex,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              transition: "transform 0.2s",
            }}
          />
        ))}
      </div>

      <Button onClick={handleAddTints} variant="primary">
        {formatMessage({ id: "addtoDesign", defaultMessage: "Add to design" })}
      </Button>
    </>
  );

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        {/* Tab Navigation */}
        <SegmentedControl
          value={activeTab}
          defaultValue="palette"
          onChange={(tab) => setActiveTab(tab as "palette" | "tints")}
          options={[
            {
              label: formatMessage({
                id: "palette_label",
                defaultMessage: "Palette",
                description: "Label for the color palette tab in the segmented control",
              }),
              value: "palette",
            },
            {
             label: formatMessage({
              id: "tints_label",
              defaultMessage: "Tints",
              description: "Label for the color tints tab in the segmented control",
            }),
              value: "tints",
            },
          ]}
        />

        {/* Tab content */}
        {activeTab === "palette" && <Palette />}
        {activeTab === "tints" && <Tints />}
      </Rows>
    </div>
  );
};
