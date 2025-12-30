import Link from "next/link";
import { Search, BarChart3, Users, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

const modules = [
  {
    id: "ogs",
    name: "OGS",
    description: "Outil de Gestion SEO",
    icon: Search,
    available: true,
    href: "/ogs/app",
  },
  {
    id: "business",
    name: "Business",
    description: "Suivi BP & Performance",
    icon: BarChart3,
    available: false,
  },
  {
    id: "perf-formations",
    name: "Formations",
    description: "Performance par formation",
    icon: GraduationCap,
    available: false,
  },
  {
    id: "cm",
    name: "CM",
    description: "Community Management",
    icon: Users,
    available: false,
  },
  {
    id: "bible",
    name: "Bible",
    description: "Documentation formations",
    icon: BookOpen,
    available: false,
  },
];

const YouSchoolLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="180"
    height="40"
    viewBox="0 0 253 55"
    fill="none"
  >
    <path
      d="M41.3479 3.06396H6.65214C2.98556 3.06396 0 6.04952 0 9.7161V44.4118C0 48.0784 2.98556 51.064 6.65214 51.064H41.3479C45.0144 51.064 48 48.0784 48 44.4118V9.7161C48 6.04952 45.0144 3.06396 41.3479 3.06396ZM46.8325 44.4118C46.8325 47.4339 44.376 49.8904 41.3479 49.8904H6.65214C3.6301 49.8904 1.16747 47.4339 1.16747 44.4057V9.7161C1.17355 6.69406 3.6301 4.23751 6.65214 4.23751H41.3479C44.3699 4.23751 46.8325 6.69406 46.8325 9.72219V44.4179V44.4118Z"
      fill="url(#paint0_linear)"
    />
    <path
      d="M25.5627 26.3404L31.3879 22.3151V17.4081H12.6658L25.5627 26.3404Z"
      fill="url(#paint1_linear)"
    />
    <path
      d="M32.0385 22.6555V30.8096L38.3988 35.2058V18.2532L32.0385 22.6555Z"
      fill="url(#paint2_linear)"
    />
    <path
      d="M17.4269 21.5003L11.9423 17.7121V35.7592L17.4269 31.971V21.5003Z"
      fill="url(#paint3_linear)"
    />
    <path
      d="M31.3879 36.0571V23.1055L12.6658 36.0571H31.3879Z"
      fill="url(#paint4_linear)"
    />
    <path
      d="M86.464 14.936L77.968 31.316V40.064H72.928V31.316L64.396 14.936H70.084L75.484 26.42L80.848 14.936H86.464ZM98.2267 40.388C96.3067 40.388 94.5787 39.968 93.0427 39.128C91.5067 38.264 90.2947 37.052 89.4067 35.492C88.5427 33.932 88.1107 32.132 88.1107 30.092C88.1107 28.052 88.5547 26.252 89.4427 24.692C90.3547 23.132 91.5907 21.932 93.1507 21.092C94.7107 20.228 96.4507 19.796 98.3707 19.796C100.291 19.796 102.031 20.228 103.591 21.092C105.151 21.932 106.375 23.132 107.263 24.692C108.175 26.252 108.631 28.052 108.631 30.092C108.631 32.132 108.163 33.932 107.227 35.492C106.315 37.052 105.067 38.264 103.483 39.128C101.923 39.968 100.171 40.388 98.2267 40.388ZM98.2267 35.996C99.1387 35.996 99.9907 35.78 100.783 35.348C101.599 34.892 102.247 34.22 102.727 33.332C103.207 32.444 103.447 31.364 103.447 30.092C103.447 28.196 102.943 26.744 101.935 25.736C100.951 24.704 99.7387 24.188 98.2987 24.188C96.8587 24.188 95.6467 24.704 94.6627 25.736C93.7027 26.744 93.2227 28.196 93.2227 30.092C93.2227 31.988 93.6907 33.452 94.6267 34.484C95.5867 35.492 96.7867 35.996 98.2267 35.996ZM131.156 20.12V40.064H126.08V37.544C125.432 38.408 124.58 39.092 123.524 39.596C122.492 40.076 121.364 40.316 120.14 40.316C118.58 40.316 117.2 39.992 116 39.344C114.8 38.672 113.852 37.7 113.156 36.428C112.484 35.132 112.148 33.596 112.148 31.82V20.12H117.188V31.1C117.188 32.684 117.584 33.908 118.376 34.772C119.168 35.612 120.248 36.032 121.616 36.032C123.008 36.032 124.1 35.612 124.892 34.772C125.684 33.908 126.08 32.684 126.08 31.1V20.12H131.156ZM143.905 40.316C142.273 40.316 140.845 40.028 139.621 39.452C138.397 38.876 137.437 38.096 136.741 37.112C136.069 36.128 135.685 35.036 135.589 33.836H137.281C137.473 35.156 138.085 36.332 139.117 37.364C140.173 38.396 141.769 38.912 143.905 38.912C145.153 38.912 146.233 38.684 147.145 38.228C148.081 37.772 148.801 37.148 149.305 36.356C149.809 35.564 150.061 34.688 150.061 33.728C150.061 32.504 149.761 31.532 149.161 30.812C148.585 30.092 147.853 29.552 146.965 29.192C146.101 28.832 144.925 28.448 143.437 28.04C141.805 27.608 140.485 27.176 139.477 26.744C138.493 26.312 137.653 25.652 136.957 24.764C136.285 23.852 135.949 22.616 135.949 21.056C135.949 19.856 136.261 18.764 136.885 17.78C137.533 16.772 138.445 15.98 139.621 15.404C140.797 14.828 142.153 14.54 143.689 14.54C145.921 14.54 147.721 15.092 149.089 16.196C150.457 17.3 151.273 18.656 151.537 20.264H149.809C149.665 19.616 149.341 18.956 148.837 18.284C148.357 17.612 147.661 17.06 146.749 16.628C145.861 16.172 144.793 15.944 143.545 15.944C141.865 15.944 140.449 16.412 139.297 17.348C138.145 18.26 137.569 19.484 137.569 21.02C137.569 22.244 137.869 23.228 138.469 23.972C139.069 24.692 139.801 25.244 140.665 25.628C141.553 25.988 142.741 26.36 144.229 26.744C145.885 27.2 147.193 27.644 148.153 28.076C149.137 28.484 149.965 29.144 150.637 30.056C151.333 30.944 151.681 32.156 151.681 33.692C151.681 34.82 151.381 35.888 150.781 36.896C150.181 37.904 149.293 38.732 148.117 39.38C146.965 40.004 145.561 40.316 143.905 40.316ZM155.522 30.272C155.522 28.232 155.918 26.456 156.71 24.944C157.526 23.432 158.642 22.28 160.058 21.488C161.498 20.672 163.142 20.264 164.99 20.264C167.438 20.264 169.442 20.876 171.002 22.1C172.586 23.324 173.57 24.968 173.954 27.032H172.262C171.95 25.352 171.134 24.032 169.814 23.072C168.518 22.112 166.91 21.632 164.99 21.632C163.55 21.632 162.242 21.956 161.066 22.604C159.89 23.228 158.942 24.2 158.222 25.52C157.526 26.816 157.178 28.4 157.178 30.272C157.178 32.168 157.526 33.764 158.222 35.06C158.942 36.356 159.89 37.328 161.066 37.976C162.242 38.624 163.55 38.948 164.99 38.948C166.91 38.948 168.518 38.468 169.814 37.508C171.134 36.548 171.95 35.228 172.262 33.548H173.954C173.57 35.588 172.586 37.232 171.002 38.48C169.418 39.728 167.414 40.352 164.99 40.352C163.142 40.352 161.498 39.944 160.058 39.128C158.642 38.312 157.526 37.148 156.71 35.636C155.918 34.1 155.522 32.312 155.522 30.272ZM187.746 20.12C190.05 20.12 191.934 20.84 193.398 22.28C194.862 23.696 195.594 25.808 195.594 28.616V40.064H194.01V28.724C194.01 26.396 193.422 24.62 192.246 23.396C191.07 22.148 189.474 21.524 187.458 21.524C185.346 21.524 183.654 22.196 182.382 23.54C181.134 24.884 180.51 26.876 180.51 29.516V40.064H178.89V13.424H180.51V24.656C181.062 23.192 181.986 22.076 183.282 21.308C184.578 20.516 186.066 20.12 187.746 20.12ZM209.923 40.352C208.099 40.352 206.455 39.944 204.991 39.128C203.527 38.312 202.375 37.148 201.535 35.636C200.719 34.1 200.311 32.312 200.311 30.272C200.311 28.256 200.731 26.492 201.571 24.98C202.411 23.444 203.563 22.28 205.027 21.488C206.515 20.672 208.171 20.264 209.995 20.264C211.819 20.264 213.463 20.672 214.927 21.488C216.391 22.28 217.531 23.432 218.347 24.944C219.187 26.456 219.607 28.232 219.607 30.272C219.607 32.312 219.187 34.1 218.347 35.636C217.507 37.148 216.343 38.312 214.855 39.128C213.391 39.944 211.747 40.352 209.923 40.352ZM209.923 38.912C211.339 38.912 212.659 38.6 213.883 37.976C215.131 37.328 216.127 36.356 216.871 35.06C217.615 33.764 217.987 32.168 217.987 30.272C217.987 28.4 217.615 26.816 216.871 25.52C216.127 24.224 215.143 23.264 213.919 22.64C212.695 21.992 211.375 21.668 209.959 21.668C208.543 21.668 207.223 21.992 205.999 22.64C204.799 23.264 203.827 24.224 203.083 25.52C202.339 26.816 201.967 28.4 201.967 30.272C201.967 32.168 202.327 33.764 203.047 35.06C203.791 36.356 204.763 37.328 205.963 37.976C207.187 38.6 208.507 38.912 209.923 38.912ZM233.126 40.352C231.302 40.352 229.658 39.944 228.194 39.128C226.73 38.312 225.578 37.148 224.738 35.636C223.922 34.1 223.514 32.312 223.514 30.272C223.514 28.256 223.934 26.492 224.774 24.98C225.614 23.444 226.766 22.28 228.23 21.488C229.718 20.672 231.374 20.264 233.198 20.264C235.022 20.264 236.666 20.672 238.13 21.488C239.594 22.28 240.734 23.432 241.55 24.944C242.39 26.456 242.81 28.232 242.81 30.272C242.81 32.312 242.39 34.1 241.55 35.636C240.71 37.148 239.546 38.312 238.058 39.128C236.594 39.944 234.95 40.352 233.126 40.352ZM233.126 38.912C234.542 38.912 235.862 38.6 237.086 37.976C238.334 37.328 239.33 36.356 240.074 35.06C240.818 33.764 241.19 32.168 241.19 30.272C241.19 28.4 240.818 26.816 240.074 25.52C239.33 24.224 238.346 23.264 237.122 22.64C235.898 21.992 234.578 21.668 233.162 21.668C231.746 21.668 230.426 21.992 229.202 22.64C228.002 23.264 227.03 24.224 226.286 25.52C225.542 26.816 225.17 28.4 225.17 30.272C225.17 32.168 225.53 33.764 226.25 35.06C226.994 36.356 227.966 37.328 229.166 37.976C230.39 38.6 231.71 38.912 233.126 38.912ZM249.345 13.424V40.064H247.725V13.424H249.345Z"
      fill="currentColor"
      className="text-foreground"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="2.65113"
        y1="6.11033"
        x2="45.3671"
        y2="48.0358"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB808" />
        <stop offset="0.25" stopColor="#ED1E79" />
        <stop offset="0.75" stopColor="#29ABE2" />
        <stop offset="1" stopColor="#19DBAD" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1="15.396"
        y1="12.9449"
        x2="37.5475"
        y2="28.0673"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB808" />
        <stop offset="0.25" stopColor="#ED1E79" />
        <stop offset="0.75" stopColor="#29ABE2" />
        <stop offset="1" stopColor="#19DBAD" />
      </linearGradient>
      <linearGradient
        id="paint2_linear"
        x1="16.2838"
        y1="11.6436"
        x2="38.4353"
        y2="26.7599"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB808" />
        <stop offset="0.25" stopColor="#ED1E79" />
        <stop offset="0.75" stopColor="#29ABE2" />
        <stop offset="1" stopColor="#19DBAD" />
      </linearGradient>
      <linearGradient
        id="paint3_linear"
        x1="7.88044"
        y1="23.9629"
        x2="30.0259"
        y2="39.0792"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB808" />
        <stop offset="0.25" stopColor="#ED1E79" />
        <stop offset="0.75" stopColor="#29ABE2" />
        <stop offset="1" stopColor="#19DBAD" />
      </linearGradient>
      <linearGradient
        id="paint4_linear"
        x1="9.75932"
        y1="21.2084"
        x2="31.9108"
        y2="36.3247"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB808" />
        <stop offset="0.25" stopColor="#ED1E79" />
        <stop offset="0.75" stopColor="#29ABE2" />
        <stop offset="1" stopColor="#19DBAD" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-end gap-2 p-4">
        <ThemeToggle />
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Connexion</Link>
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Logo */}
        <div className="mb-12">
          <YouSchoolLogo />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-medium mb-2">
          Hub
        </h1>
        <p className="text-muted-foreground mb-12">
          Sélectionnez un module
        </p>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl w-full">
          {modules.map((module) => {
            const ModuleIcon = module.icon;

            if (module.available && module.href) {
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className="flex flex-col items-center p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-accent transition-colors">
                    <ModuleIcon className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">
                    {module.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    {module.description}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            }

            return (
              <div
                key={module.id}
                className="flex flex-col items-center p-6 rounded-xl border border-border/50 bg-muted/50 opacity-60 cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <ModuleIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {module.name}
                </span>
                <span className="text-xs text-muted-foreground/70 mt-1 text-center">
                  {module.description}
                </span>
                <span className="mt-3 px-2 py-0.5 bg-secondary text-muted-foreground text-[10px] font-medium rounded-full uppercase tracking-wide">
                  Soon
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-xs text-muted-foreground">
          YouSchool Hub
        </div>
      </main>
    </div>
  );
}
