type Token = { t: string; c?: string };

const KW = "text-[#7A3CE8]"; // plum-ish keyword
const STR = "text-[#E8B53C]"; // mustard strings
const FN = "text-[#3C7AE8]"; // sky function name
const COM = "text-offwhite/40"; // comment
const ACC = "text-tomato"; // accent
const DEF = "text-offwhite";

function L(tokens: Token[]) {
  return tokens;
}

const lines: Token[][] = [
  L([{ t: "import", c: KW }, { t: " { Mindform } ", c: DEF }, { t: "from", c: KW }, { t: " ", c: DEF }, { t: '"mindform"', c: STR }]),
  L([{ t: "", c: DEF }]),
  L([{ t: "const", c: KW }, { t: " mf ", c: DEF }, { t: "=", c: ACC }, { t: " ", c: DEF }, { t: "new", c: KW }, { t: " ", c: DEF }, { t: "Mindform", c: FN }, { t: "({ apiKey: process.env.MF })", c: DEF }]),
  L([{ t: "", c: DEF }]),
  L([{ t: "// Same conversation, three voices.", c: COM }]),
  L([{ t: "const", c: KW }, { t: " thread ", c: DEF }, { t: "=", c: ACC }, { t: " ", c: DEF }, { t: "await", c: KW }, { t: " mf.threads.", c: DEF }, { t: "create", c: FN }, { t: "()", c: DEF }]),
  L([{ t: "", c: DEF }]),
  L([{ t: "await", c: KW }, { t: " mf.chat.", c: DEF }, { t: "send", c: FN }, { t: "({ thread, personality: ", c: DEF }, { t: '"ada"', c: STR }, { t: ", input: ", c: DEF }, { t: '"Explain merge sort."', c: STR }, { t: " })", c: DEF }]),
  L([{ t: "await", c: KW }, { t: " mf.chat.", c: DEF }, { t: "send", c: FN }, { t: "({ thread, personality: ", c: DEF }, { t: '"mox"', c: STR }, { t: ", input: ", c: DEF }, { t: '"Now tell it like a kid."', c: STR }, { t: " })", c: DEF }]),
  L([{ t: "await", c: KW }, { t: " mf.chat.", c: DEF }, { t: "send", c: FN }, { t: "({ thread, personality: ", c: DEF }, { t: '"orin"', c: STR }, { t: ", input: ", c: DEF }, { t: '"And like a tired sailor."', c: STR }, { t: " })", c: DEF }]),
  L([{ t: "", c: DEF }]),
  L([{ t: "// Memory persists across the swap.", c: COM }]),
];

export default function CodeBlock() {
  return (
    <div
      className="border border-tomato bg-offblack text-offwhite font-mono text-[14px] leading-[1.7]"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-tomato/40 text-[11px] uppercase tracking-widest">
        <span className="text-tomato">POST /v1/chat/completions</span>
        <span className="text-offwhite/40">node.js</span>
      </div>
      <pre
        className="px-4 py-4 overflow-x-auto"
        aria-label="Example code calling the Mindform API"
      >
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block">
              <span className="inline-block w-8 mr-3 text-offwhite/25 select-none text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              {line.map((tok, j) => (
                <span key={j} className={tok.c ?? DEF}>
                  {tok.t}
                </span>
              ))}
              {line.length === 0 || (line.length === 1 && line[0].t === "") ? " " : null}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
