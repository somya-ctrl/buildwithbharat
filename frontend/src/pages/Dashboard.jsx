import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Footer from '../components/Footer.jsx'

const WORKSPACES = [
  {
    icon: 'terminal',
    tag: 'v1.2.4',
    name: 'quantum-engine',
    activity: 'Active 2h ago',
    lang: 'TypeScript',
    avatars: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiS3dezoIeaVHpsjNrq6QkKnGpiDr-8yVZuktS0yXV8p1mN_4glalChZY2ZDGmijR3YLK7rYU9OLq1r6k4qIdVsimlRCLC8ygKoqLXRI6BdtgvnQ-Rtso_072axYngWj2ERPe0WUNDrUWnjd9nzd0A-qhbGsZnIplp5_tfEPlF6VsBbxcOfteLIyph4VAbb0I1PRytm-uF6NkPsVm2hFh77DSW2ZQCJ64MW_JzzG3WiRCMazCKzFlt3-PNWJy7VD0DVCroXwIO_OJD',
      },
    ],
    extraCount: 3,
  },
  {
    icon: 'rocket_launch',
    tag: 'prod-beta',
    name: 'nebula-dashboard',
    activity: 'Active 5m ago',
    lang: 'React',
    avatars: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1Dftk2UBjJp63T7-w4FUlBCxwu-KQWMmi2hJWUP5y4W3or-98LtRlsUgZt_xL4_Rhaa-7Ynh_tGLIDdxijoVdTBb9Rf2cExtI1D2PaLWpxUdBlvRRlp8odbwi-zmqu8k1o4nnm-0HHlJZLkNxyebdo8DuAkkescn6qoTLtcLQMv0GLAx1NQ5_7hFq-jclcP-thrd9rzpLm_3rofaKuKvAbwfn4HEve5s9Bq2fRJ0hYVqLtsCn4ocWHrXMwXQU-m_fRcZmoCO1G07n',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4_fNSgUGyhRagebBSa-7xAOufXWscSVBiGd-eXqeAoijpdtBs_FTgz__BcGovzx9Bs8bVA4upd_O5ujCjjamvW-eydginv3Gf482Q1TpETsSj15QPwqdBKTbEMkbIIzvDkpBSB5g6K4HKOr7TxVgMAly7udsP6vdMdmRAHmN1Q3oZYPNCqxEA7T0KoAceqAwuvszzz-yi2cKy7zxJIHx7LtVxxZnVAAUaI200Rrm1_cgOJU2m4Lo0KlqoSLMw6e6nVUjpkHfvwXD0',
      },
    ],
  },
  {
    icon: 'data_object',
    tag: 'dev',
    name: 'api-gateway-v3',
    activity: 'Active Yesterday',
    lang: 'Go',
    avatars: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV1Kz4r8VoPofnZNkCtTqBSy98sjs2vN3uI2xdppp3LOU5r9VYcK85uzRXkgCZD7jjfH-mwGKPSaneoZAVSQCAtNPYFexFiQ_O47oImqMdHXWDKpCjXUPIwn2qb-yCUzJl74Szvl1zzVHxqwfI_xsz-1ULQxGmPIfIhNNq6n7HlNib1Cm6J-tP_FfDUdLSp38kcu3VB0was2tjeOdQjiZLX4ywSifOJmZnwpuubUfbowrZH9kHwsbyIUubRVgTP97Gvv1YwtGcEaun',
      },
    ],
  },
  {
    icon: 'security',
    tag: 'audit',
    name: 'auth-microservice',
    activity: 'Active 4d ago',
    lang: 'Rust',
    avatars: [{ initials: 'JD' }],
  },
]

const QUICK_ACTIONS = [
  {
    icon: 'add',
    title: 'New Project',
    subtitle: 'Initialize repository',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    icon: 'person_add',
    title: 'Invite Team',
    subtitle: 'Add collaborators',
    iconBg: 'bg-secondary-container/50 text-secondary',
  },
  {
    icon: 'menu_book',
    title: 'View Docs',
    subtitle: 'API reference',
    iconBg: 'bg-secondary-container/50 text-secondary',
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/20">
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-margin-page pb-24 lg:ml-[240px] lg:pb-margin-page">
          <div className="mx-auto max-w-container-max space-y-stack-lg">
            {/* Hero */}
            <section className="grid grid-cols-1 items-center gap-stack-md md:grid-cols-3">
              <div className="md:col-span-1">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Good morning, Alex
                </h2>
                <p className="mt-1 font-body-lg text-body-lg text-secondary">
                  Ready to push some high-performance code today?
                </p>
              </div>
              <div className="flex flex-col gap-stack-md sm:flex-row md:col-span-2">
                <div className="group flex-1 cursor-pointer rounded-xl border border-primary/20 bg-primary-container p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-surface/20 p-2 text-white">
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-white/40 transition-colors group-hover:text-white">
                      arrow_forward
                    </span>
                  </div>
                  <h3 className="mt-4 font-headline-md text-headline-md font-bold text-white">
                    Create Workspace
                  </h3>
                  <p className="mt-1 font-body-md text-body-md text-white/80">
                    Launch a new isolated development environment.
                  </p>
                </div>
                <div className="group flex-1 cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-secondary-container p-2 text-primary">
                      <span className="material-symbols-outlined">
                        group_add
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-secondary/40 transition-colors group-hover:text-primary">
                      arrow_forward
                    </span>
                  </div>
                  <h3 className="mt-4 font-headline-md text-headline-md font-bold text-on-surface">
                    Join Workspace
                  </h3>
                  <p className="mt-1 font-body-md text-body-md text-secondary">
                    Connect to an existing team infrastructure.
                  </p>
                </div>
              </div>
            </section>

            {/* Recent Workspaces */}
            <section>
              <div className="mb-stack-md flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Recent Workspaces
                </h3>
                <button className="font-label-md text-label-md text-primary hover:underline">
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 xl:grid-cols-4">
                {WORKSPACES.map((ws) => (
                  <div
                    key={ws.name}
                    className="group rounded-[16px] border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container">
                        <span className="material-symbols-outlined text-primary">
                          {ws.icon}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-outline-variant transition-colors group-hover:text-primary">
                        {ws.tag}
                      </span>
                    </div>
                    <h4 className="font-body-lg text-body-lg font-bold text-on-surface">
                      {ws.name}
                    </h4>
                    <p className="mt-1 flex items-center gap-1 font-label-md text-label-md text-secondary">
                      <span className="material-symbols-outlined text-[14px]">
                        schedule
                      </span>
                      {ws.activity}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {ws.avatars.map((a, i) =>
                          a.src ? (
                            <div
                              key={i}
                              className="h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-secondary-container"
                            >
                              <img
                                src={a.src}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-secondary-container text-[8px] font-bold text-primary"
                            >
                              {a.initials}
                            </div>
                          ),
                        )}
                        {ws.extraCount && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-tertiary-container text-[8px] text-white">
                            +{ws.extraCount}
                          </div>
                        )}
                      </div>
                      <div className="code-font rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold">
                        {ws.lang}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Two Column Layout & Quick Actions */}
            <div className="grid grid-cols-1 gap-stack-lg xl:grid-cols-12">
              {/* Recent Activity */}
              <div className="space-y-stack-md xl:col-span-6">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Recent Activity
                </h3>
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                  <div className="divide-y divide-outline-variant">
                    <div className="flex gap-4 p-4 transition-colors hover:bg-surface">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                        <span className="material-symbols-outlined text-sm">
                          commit
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body-md text-body-md leading-snug text-on-surface">
                          <span className="font-bold">Sarah Miller</span>{' '}
                          pushed 3 commits to{' '}
                          <span className="code-font text-primary">main</span>
                        </p>
                        <div className="code-font mt-2 rounded border border-outline-variant/30 bg-surface-container-low p-2 text-xs text-secondary">
                          feat(auth): add OIDC support for enterprise clients
                        </div>
                        <p className="mt-2 font-label-md text-label-md text-outline">
                          12 minutes ago
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 transition-colors hover:bg-surface">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error-container text-error">
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          error
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body-md text-body-md leading-snug text-on-surface">
                          Deployment failed in{' '}
                          <span className="font-bold">nebula-dashboard</span>
                        </p>
                        <p className="mt-1 font-body-md text-body-md text-secondary">
                          CI/CD Pipeline #4492: Connection timeout in staging
                          env.
                        </p>
                        <p className="mt-2 font-label-md text-label-md text-outline">
                          1 hour ago
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 transition-colors hover:bg-surface">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-container/10 text-tertiary">
                        <span className="material-symbols-outlined text-sm">
                          comment
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body-md text-body-md leading-snug text-on-surface">
                          <span className="font-bold">James Wilson</span>{' '}
                          commented on PR{' '}
                          <span className="font-bold text-primary">#102</span>
                        </p>
                        <p className="mt-1 font-body-md text-body-md italic text-secondary">
                          &quot;Looks good, but we should double check the
                          memory allocation here.&quot;
                        </p>
                        <p className="mt-2 font-label-md text-label-md text-outline">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full border-t border-outline-variant py-3 text-center font-label-md text-label-md text-secondary transition-colors hover:bg-surface">
                    Load more activity
                  </button>
                </div>
              </div>

              {/* Meetings */}
              <div className="space-y-stack-md xl:col-span-3">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Meetings
                </h3>
                <div className="space-y-stack-sm">
                  <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-primary/5 p-2 text-primary">
                        <span className="material-symbols-outlined">
                          video_camera_front
                        </span>
                      </div>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Now
                      </span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg font-bold">
                        Architecture Review
                      </h4>
                      <p className="font-label-md text-label-md text-secondary">
                        Cloud Team Sync
                      </p>
                    </div>
                    <button className="w-full rounded-lg bg-primary py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary/90">
                      Join Meeting
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                    <div>
                      <p className="font-label-md text-label-md text-secondary">
                        2:30 PM — 3:00 PM
                      </p>
                      <h4 className="font-body-md text-body-md font-bold">
                        Weekly Standup
                      </h4>
                    </div>
                    <button className="rounded-lg p-2 text-primary transition-colors hover:bg-surface-container">
                      <span className="material-symbols-outlined">link</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 opacity-60 shadow-sm">
                    <div>
                      <p className="font-label-md text-label-md text-secondary">
                        4:00 PM
                      </p>
                      <h4 className="font-body-md text-body-md font-bold">
                        Client Demo
                      </h4>
                    </div>
                    <button className="rounded-lg p-2 text-secondary transition-colors hover:bg-surface-container">
                      <span className="material-symbols-outlined">link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-stack-md xl:col-span-3">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-stack-sm">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.title}
                      className="group flex items-center gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover:bg-primary group-hover:text-white ${action.iconBg}`}
                      >
                        <span className="material-symbols-outlined">
                          {action.icon}
                        </span>
                      </div>
                      <div>
                        <span className="block font-body-md text-body-md font-bold">
                          {action.title}
                        </span>
                        <span className="block font-label-md text-label-md text-secondary">
                          {action.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}

                  <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container p-5 text-center">
                    <div className="animate-spin-slow mb-4 h-16 w-16 rounded-full border-4 border-primary border-t-transparent" />
                    <p className="font-body-md text-body-md font-bold">
                      Cloud Usage
                    </p>
                    <p className="font-label-md text-label-md text-secondary">
                      82% of quota reached
                    </p>
                    <button className="mt-4 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
