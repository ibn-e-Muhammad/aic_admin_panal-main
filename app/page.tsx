'use client';
import Link from "next/link";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";

import { Button } from '@/components/ui/button'; 
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Homes() {
  

  const router = useRouter();
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/get-events');
      const data = await response.json();
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const logout = async () => {

    const supabase = createClient();
  
    try {
      await supabase.auth.signOut();
     
      document.cookie = 'auth_token=; path=/; max-age=0'; 
      router.push('/login');
      
    } catch (error: any) {
      console.error('Logout Error:', error.message);
    } 

   


  }
  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); 
      }
    };

    checkUser();
  }, [router]);
  

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">AIC DASHBOARD</span>
            </Link>
            
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="#"
                className="flex items-center bg-muted  gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4 " />
                Dashboard
              </Link>
              <Link
                href="/event"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                Events
              </Link>
              <Link
                href="/sponsored"
                className="flex items-center gap-3 rounded-lg  px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Sponsoreds{" "}
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-3 rounded-lg   px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Blogs{" "}
              </Link>
              <Link
                href="/news"
                className="flex items-center gap-3 rounded-lg   px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                News{" "}
              </Link>
              
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">AIC DASBOARD</span>
                </Link>
                <Link
                  href="#"
                  className="mx-[-0.65rem] bg-muted flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/event"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl  px-3 py-2 text-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Events
                </Link>
                <Link
                  href="/sponsored"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Sponsored
                </Link>
                <Link
                  href="/blog"
                  className="mx-[-0.65rem] flex items-center gap-4  rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Blogs
                </Link>
                <Link
                  href="/news"
                  className="mx-[-0.65rem] flex items-center gap-4  rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  News
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
                
                



              </Button>
             

            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <button onClick={logout}>
                  Logout
                </button>
              </DropdownMenuLabel>
              
            </DropdownMenuContent>
           
          </DropdownMenu>
          
         


        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 items-center justify-center text-5xl">
          Welcome Web Master
        </main>
      </div>
    </div>
  );
}
