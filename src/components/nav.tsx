
'use client';

import {
  BookHeart,
  Droplets,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Users,
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
  { href: '/wants-needs', icon: HeartHandshake, label: 'Wants & Needs' },
  { href: '/cycle-tracker', icon: Droplets, label: 'Cycle Tracker' },
  { href: '/tasks', icon: ListTodo, label: 'Task Manager' },
  { href: '/health-metrics', icon: HeartPulse, label: 'Health Metrics' },
  { href: '/diary', icon: BookHeart, label: 'Daily Diary' },
  { href: '/insights', icon: Sparkles, label: 'Insights' },
  { href: '/anas-reflection', icon: Users, label: 'Relationship Tracker' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            className="font-headline"
          >
            <Link href={item.href}>
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
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
