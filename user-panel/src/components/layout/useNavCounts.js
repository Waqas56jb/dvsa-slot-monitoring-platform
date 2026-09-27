import { useResource } from '@/hooks';
import { slotService, notificationService } from '@/services';

/** Badge counts for navigation (new slots, unread notifications). Live-updating. */
export function useNavCounts() {
  const { data } = useResource(
    async () => {
      const [slots, unread] = await Promise.all([slotService.counts(), notificationService.unreadCount()]);
      return { newSlots: slots.new, unreadNotifications: unread };
    },
    [],
    { topics: ['slots', 'notifications'], initialData: { newSlots: 0, unreadNotifications: 0 } },
  );
  return data || { newSlots: 0, unreadNotifications: 0 };
}
