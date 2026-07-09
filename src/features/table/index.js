import "../../components/blocks/table/table-block.js";
import "../../components/toolbars/controls/format-table-headers.js";
import "../../components/toolbars/controls/table-style-color.js";
import "../../components/toolbars/controls/table-style-selector.js";
import { registerBlock } from "../../registries/block-registry.js";
import { registerCommand } from "../../registries/command-registry.js";
import { FEATURES } from "../../registries/formatter-registry.js";

registerBlock({
  type: "table",
  tagName: "table-block",
  selector: "table-block",
  text: false,
  formattable: true,
  capabilities: [FEATURES.tableHeaders, FEATURES.backgroundColor, FEATURES.border],
});

registerCommand({ command: "tableHeaderRow", feature: FEATURES.tableHeaders });
registerCommand({ command: "tableHeaderColumn", feature: FEATURES.tableHeaders });
registerCommand({ command: "tableStripedRows", feature: FEATURES.backgroundColor });
