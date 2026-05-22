import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/context/ThemeContext";

type Props = {
  visible: boolean;
  selectedDate?: string;
  minDate?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parts = value.split("-").map(Number);
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const getMonthMatrix = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const cells: { date: Date; inCurrentMonth: boolean }[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    const day = previousMonthDays - firstWeekday + index + 1;
    cells.push({
      date: new Date(year, month - 1, day),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day),
      inCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (firstWeekday + daysInMonth) + 1;
    cells.push({
      date: new Date(year, month + 1, day),
      inCurrentMonth: false,
    });
  }

  return cells;
};

export default function CalendarPickerModal({
  visible,
  selectedDate,
  minDate,
  onClose,
  onSelect,
}: Props) {
  const theme = useTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => parseDate(selectedDate) ?? new Date());

  useEffect(() => {
    if (visible) {
      setVisibleMonth(parseDate(selectedDate) ?? new Date());
    }
  }, [selectedDate, visible]);

  const selected = useMemo(() => selectedDate ?? "", [selectedDate]);
  const monthCells = useMemo(() => getMonthMatrix(visibleMonth), [visibleMonth]);
  const monthRows = useMemo(() => {
    const rows: { date: Date; inCurrentMonth: boolean }[][] = [];

    for (let index = 0; index < monthCells.length; index += 7) {
      rows.push(monthCells.slice(index, index + 7));
    }

    return rows;
  }, [monthCells]);
  const minAllowedDate = useMemo(() => {
    const parsed = parseDate(minDate);
    return parsed ? normalizeDate(parsed) : null;
  }, [minDate]);

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />

        <View
          style={[
            s.modalCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={s.headerRow}>
            <Pressable
              onPress={() => changeMonth(-1)}
              style={[s.iconButton, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
            </Pressable>

            <Text style={[s.headerTitle, { color: theme.colors.text }]}>{monthLabel}</Text>

            <Pressable
              onPress={() => changeMonth(1)}
              style={[s.iconButton, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={s.labelsRow}>
            {dayLabels.map((label) => (
              <Text key={label} style={[s.dayLabel, { color: theme.colors.textMuted }]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={s.grid}>
            {monthRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={s.weekRow}>
                {row.map((cell) => {
                  const value = formatDate(cell.date);
                  const isSelected = value === selected;
                  const isDisabled =
                    minAllowedDate !== null &&
                    normalizeDate(cell.date).getTime() < minAllowedDate.getTime();

                  return (
                    <Pressable
                      key={value}
                      disabled={isDisabled}
                      style={[
                        s.dayCellWrap,
                        {
                          opacity: cell.inCurrentMonth ? 1 : 0.55,
                        },
                      ]}
                      onPress={() => {
                        onSelect(value);
                        onClose();
                      }}
                    >
                      <View
                        style={[
                          s.dayCell,
                          {
                            backgroundColor: isDisabled
                              ? "#D4D8DD"
                              : isSelected
                                ? theme.colors.tabIconActive
                                : theme.colors.surfaceAlt,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.dayText,
                            {
                              color: isDisabled
                                ? "#7C8793"
                                : isSelected
                                  ? "#FFFFFF"
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {cell.date.getDate()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            style={[s.closeButton, { backgroundColor: theme.colors.accent }]}
          >
            <Text style={s.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  labelsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
    gap: 8,
  },
  dayCellWrap: {
    flex: 1,
  },
  dayCell: {
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontWeight: "700",
  },
  closeButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
