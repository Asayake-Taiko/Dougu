import { OrgOwnership, Container } from "../../types/models";
import { csvSheet } from "../../components/organization/Sheet";

// chunk the equipment into groups of size
export const chunkArray = <T>(items: T[], size: number) =>
  items.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, items.slice(i, i + size)]),
    [] as T[][],
  );

// get the csv data for the organization to export to google sheets
export const getSheetData = (
  ownerships: Map<string, OrgOwnership>,
  showEmpty: boolean,
  showContainerEquip: boolean,
): csvSheet => {
  const counts: { [key: string]: { [key: string]: number } } = {};
  // get all the unique equipment labels
  const uniqueLabels: { [key: string]: number } = {};

  // fill out dictionary with equipment counts for each member
  ownerships.forEach((ownership) => {
    const assignedToName = ownership.membership.name;
    const items = ownership.items;

    // skip owners with no items if showEmpty is false
    if (!showEmpty && items.length === 0) return;

    counts[assignedToName] = {};

    items.forEach((item) => {
      counts[assignedToName][item.name] ??= 0;
      uniqueLabels[item.name] ??= 0;

      if (item.type === "equipment") {
        const count = item.count;
        counts[assignedToName][item.name] += count;
        uniqueLabels[item.name] += count;
      } else {
        // count the container itself as 1
        counts[assignedToName][item.name] += 1;
        uniqueLabels[item.name] += 1;

        // if showContainerEquip is false, don't count the equipment in the container
        if (!showContainerEquip) return;

        // count the equipment in the container
        (item as Container).equipment.forEach((equip) => {
          counts[assignedToName][equip.name] ??= 0;
          uniqueLabels[equip.name] ??= 0;
          counts[assignedToName][equip.name] += equip.count;
          uniqueLabels[equip.name] += equip.count;
        });
      }
    });
  });

  const assignedToNames = Object.keys(counts).sort();
  const equipmentLabels = Object.keys(uniqueLabels).sort();
  const identityCol = [...assignedToNames, "Total"];
  let csvContent: string[][] = [];

  // column major order for the Sheet component
  equipmentLabels.forEach((label) => {
    const col: string[] = [];
    assignedToNames.forEach((name) => {
      const countStr = counts[name][label]
        ? counts[name][label].toString()
        : "0";
      col.push(countStr);
    });
    // add the total count for each equipment label
    col.push(uniqueLabels[label].toString());
    csvContent.push(col);
  });

  return {
    header: equipmentLabels,
    identityCol: identityCol,
    values: csvContent,
  };
};
