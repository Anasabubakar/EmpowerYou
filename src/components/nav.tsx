
'use client';

import {
  BookHeart,
  Droplets,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  MessageCircleHeart,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/wants-needs', icon: HeartHandshake, label: 'Wants & Needs' },
  { href: '/cycle-tracker', icon: Droplets, label: 'Cycle Tracker' },
  { href: '/tasks', icon: ListTodo, label: 'Task Manager' },
  { href: '/health-metrics', icon: HeartPulse, label: 'Health Metrics' },
  { href: '/diary', icon: BookHeart, label: 'Daily Diary' },
  { href: '/anas-reflection', icon: Users, label: 'Relationship Tracker' },
  { href: '/companion', icon: MessageCircleHeart, label: 'My Companion' },
  { href: '/insights', icon: Sparkles, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Nav() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} onClick={handleLinkClick}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              className="font-headline cursor-pointer"
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  pathname.startsWith(item.href)
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  pathname.startsWith(item.href)
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                )}
              >
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
