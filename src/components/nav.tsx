
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
import { useAppContext } from '@/context/app-context';

export function Nav() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { companionName } = useAppContext();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/wants-needs', icon: HeartHandshake, label: 'Wants & Needs' },
    { href: '/cycle-tracker', icon: Droplets, label: 'Cycle Tracker' },
    { href: '/tasks', icon: ListTodo, label: 'Task Manager' },
    { href: '/health-metrics', icon: HeartPulse, label: 'Health Metrics' },
    { href: '/diary', icon: BookHeart, label: 'Daily Diary' },
    { href: '/relationship-tracker', icon: Users, label: 'Relationship Tracker' },
    { href: '/companion', icon: MessageCircleHeart, label: companionName },
    { href: '/insights', icon: Sparkles, label: 'Insights' },
  ];

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
              className={cn(
                'font-headline cursor-pointer',
                pathname.startsWith(item.href) &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
