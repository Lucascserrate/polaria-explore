import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { footerLinks, site } from "@/config/site";
import { integrations } from "@/content/integrations";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-paper-300 bg-paper-100 py-14">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo tone="dark" />
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-600">
              {site.description}
            </p>
            <p className="mt-4 text-sm text-ink-600">
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-medium text-brand-700 underline-offset-4 hover:underline"
              >
                {site.contactEmail}
              </a>
            </p>
          </div>

          <FooterColumn title="Producto" links={footerLinks.producto} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-paper-300 pt-7">
          {/* Exigido por la revisión de Meta: dejar explícito que no hay
              afiliación con las plataformas que se mencionan. */}
          <p className="text-pretty text-xs leading-relaxed text-ink-500">
            {integrations.disclaimer}
          </p>

          <div className="flex flex-col gap-1 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.legal.entity} · {site.legal.city}, {site.legal.country}
            </p>
            <p>Hecho para peluquerías y barberías.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm text-ink-600 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
