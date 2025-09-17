'use client';

import {
  BookHeart,
  Droplets,
  HeartHand,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/wants-needs', icon: HeartHand, label: 'Wants & Needs' },
  { href: '/cycle-tracker', icon: Droplets, label: 'Cycle Tracker' },
  { href: '/tasks', icon: ListTodo, label: 'Task Manager' },
  { href: '/health-metrics', icon: HeartPulse, label: 'Health Metrics' },
  { href: '/diary', icon: BookHeart, label: 'Daily Diary' },
  { href: '/insights', icon: Sparkles, label: 'Insights' },
  { href: '/anas-reflection', icon: UserCheck, label: 'Anas Reflection' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              className="font-headline"
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
