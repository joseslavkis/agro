import { useState } from "react";
import { toast } from "sonner";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { usePartners, usePendingInvitations, useSendInvitation, useAcceptInvitation, useDeclineInvitation, useSearchUsers } from "@/services/UserServices";
import styles from "./PartnersScreen.module.css";

export const PartnersScreen = () => {
    const { data: partners, isLoading: loadingPartners } = usePartners();
    const { data: pending } = usePendingInvitations();
    const { mutateAsync: sendInvite } = useSendInvitation();
    const { mutateAsync: acceptInvite, isPending: accepting } = useAcceptInvitation();
    const { mutateAsync: declineInvite, isPending: declining } = useDeclineInvitation();

    const [searchQuery, setSearchQuery] = useState("");
    const { data: searchResults } = useSearchUsers(searchQuery);

    const handleInvite = async (username: string) => {
        try {
            await sendInvite(username);
            setSearchQuery("");
            toast.success(`Invitación enviada a ${username}`);
        } catch (err) {
            toast.error("Error enviando invitación.");
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        handleInvite(searchQuery.trim());
    };

    return (
        <CommonLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Socios</h1>

                    <div className={styles.searchForm}>
                        <form onSubmit={handleSearchSubmit} className={styles.searchContainer}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar usuarios..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>

                        {/* Search Results Dropdown */}
                        {searchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map(user => (
                                    <div key={user.id} className={styles.searchResultItem} onClick={() => handleInvite(user.username)}>
                                        <img
                                            src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name + " " + user.lastname)}&background=random`}
                                            alt={user.username}
                                            className={styles.resultAvatar}
                                        />
                                        <div className={styles.resultInfo}>
                                            <div className={styles.resultName}>{user.name} {user.lastname}</div>
                                            <div className={styles.resultUsername}>@{user.username}</div>
                                        </div>
                                        <button className={styles.miniInviteBtn}>Invitar</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                            <div className={styles.searchResults}>
                                <div className={styles.noResults}>No se encontraron usuarios</div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Pending Invitations Section */}
                {pending && pending.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Invitaciones Pendientes</h2>
                        <div className={styles.pendingGrid}>
                            {pending.map((req) => (
                                <div key={req.id} className={styles.pendingCard}>
                                    <div className={styles.pendingInfo}>
                                        <img
                                            src={req.senderPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(req.senderName) + "&background=random"}
                                            alt={req.senderUsername}
                                            className={styles.miniAvatar}
                                        />
                                        <div>
                                            <div className={styles.pendingName}>{req.senderName}</div>
                                            <div className={styles.pendingUsername}>@{req.senderUsername}</div>
                                        </div>
                                    </div>
                                    <div className={styles.pendingActions}>
                                        <button
                                            onClick={() => acceptInvite(req.id)}
                                            className={styles.acceptButton}
                                            disabled={accepting}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => declineInvite(req.id)}
                                            className={styles.declineButton}
                                            disabled={declining}
                                        >
                                            ✗
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Partners List */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Mis Socios</h2>
                    {loadingPartners ? (
                        <div style={{ color: 'white' }}>Cargando...</div>
                    ) : partners && partners.length > 0 ? (
                        <div className={styles.grid}>
                            {partners.map((user) => (
                                <div key={user.id} className={styles.card}>
                                    <img
                                        src={user.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name + " " + user.lastname) + "&background=random"}
                                        alt={user.username}
                                        className={styles.avatar}
                                    />
                                    <h3 className={styles.name}>{user.name} {user.lastname}</h3>
                                    <div className={styles.username}>@{user.username}</div>
                                    <div className={styles.info}>
                                        <span>📧 {user.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <h3>No tienes socios confirmados aún.</h3>
                            <p>Invita a otros usuarios usando el buscador para conectar.</p>
                        </div>
                    )}
                </div>
            </div>
        </CommonLayout>
    );
};
