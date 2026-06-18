import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

interface Props {
  /** 0–100 */
  percentage: number;
  label?: string;
  showPercent?: boolean;
  height?: number;
}

const ProgressBar: React.FC<Props> = ({
  percentage,
  label,
  showPercent = true,
  height = 8,
}) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  // Colour changes based on fill level
  const fillColor =
    clamped < 60
      ? COLORS.income       // green — safe
      : clamped < 85
      ? COLORS.warning      // yellow — caution
      : COLORS.expense;     // red — over budget

  return (
    <View style={styles.wrapper}>
      {(label || showPercent) && (
        <View style={styles.row}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && (
            <Text style={[styles.percent, { color: fillColor }]}>
              {clamped.toFixed(0)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, height, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  percent: { fontSize: 13, fontWeight: '600' },
  track: {
    backgroundColor: COLORS.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: { borderRadius: 99 },
});

export default ProgressBar;
