import type { Hash, Content } from '../storage';
export default function hasher(content: Content): Promise<Hash>;
