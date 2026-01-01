/**
 * Icon Component
 * Wrapper for react-native-vector-icons
 */

import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Map our icon names to Feather icon names
const featherIconMap: Record<string, string> = {
  home: 'home',
  'book-open': 'book-open',
  'file-text': 'file-text',
  'bar-chart-2': 'bar-chart-2',
  user: 'user',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  x: 'x',
  check: 'check',
  plus: 'plus',
  minus: 'minus',
  search: 'search',
  filter: 'filter',
  mail: 'mail',
  lock: 'lock',
  eye: 'eye',
  'eye-off': 'eye-off',
  phone: 'phone',
  smartphone: 'smartphone',
  camera: 'camera',
  mic: 'mic',
  play: 'play',
  pause: 'pause',
  'volume-2': 'volume-2',
  clock: 'clock',
  calendar: 'calendar',
  star: 'star',
  heart: 'heart',
  bell: 'bell',
  settings: 'settings',
  'help-circle': 'help-circle',
  info: 'info',
  'alert-circle': 'alert-circle',
  book: 'book',
  bookmark: 'bookmark',
  award: 'award',
  target: 'target',
  'trending-up': 'trending-up',
  activity: 'activity',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  send: 'send',
  image: 'image',
  edit: 'edit-2',
  trash: 'trash-2',
  'more-horizontal': 'more-horizontal',
  'more-vertical': 'more-vertical',
  'refresh-cw': 'refresh-cw',
  'log-out': 'log-out',
  'external-link': 'external-link',
  share: 'share-2',
  download: 'download',
  upload: 'upload',
  folder: 'folder',
  file: 'file',
  copy: 'copy',
  link: 'link',
  moon: 'moon',
  sun: 'sun',
  zap: 'zap',
  layers: 'layers',
  grid: 'grid',
  list: 'list',
  menu: 'menu',
  'message-circle': 'message-circle',
  users: 'users',
  shield: 'shield',
  percent: 'percent',
  'credit-card': 'credit-card',
  building: 'briefcase',
  cast: 'cast',
  wifi: 'wifi',
  'wifi-off': 'wifi-off',
  tv: 'tv',
  monitor: 'monitor',
  airplay: 'airplay',
};

// Map our icon names to Material Community icons
const materialIconMap: Record<string, string> = {
  flame: 'fire',
  trophy: 'trophy',
  crown: 'crown',
  school: 'school',
  function: 'function-variant',
  atom: 'atom',
  flask: 'flask',
  leaf: 'leaf',
  globe: 'earth',
  history: 'history',
  'graduation-cap': 'school',
  brain: 'brain',
  lightbulb: 'lightbulb-outline',
  'check-circle': 'check-circle',
  'x-circle': 'close-circle',
  question: 'help-circle',
  bank: 'bank',
  'cast-connected': 'cast-connected',
  'television': 'television',
  'remote-tv': 'remote-tv',
};

export function Icon({name, size = 24, color = '#000', style}: IconProps) {
  // Check if it's a Material icon first
  if (materialIconMap[name]) {
    return (
      <MaterialIcon
        name={materialIconMap[name]}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  // Default to Feather icons
  const featherName = featherIconMap[name] || name;
  return (
    <FeatherIcon name={featherName} size={size} color={color} style={style} />
  );
}
