
export default function TransitionLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    // Don’t render the parent lobby/game wrappers here:
    return <>{children}</>;
}
