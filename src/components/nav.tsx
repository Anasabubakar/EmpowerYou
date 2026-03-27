
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  ];

  const reflectionItems = [
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
    <div className="space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Core
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    className={cn('font-body cursor-pointer gap-3')}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Reflections
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {reflectionItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    className={cn('font-body cursor-pointer gap-3')}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/60 text-foreground">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
