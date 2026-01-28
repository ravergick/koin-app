import { collection, getDocs, doc, writeBatch, query, where } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export const cleanupDuplicateCategories = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user logged in");
        return "No user logged in";
    }

    console.log("Starting cleanup for user:", user.uid);

    try {
        // 1. Fetch all categories
        const catsRef = collection(db, "users", user.uid, "categories");
        const catsSnap = await getDocs(catsRef);
        const cats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // 2. Group by name (case insensitive)
        const groups: Record<string, any[]> = {};
        cats.forEach(c => {
            const name = c.nombre?.trim().toLowerCase();
            if (!name) return;
            if (!groups[name]) groups[name] = [];
            groups[name].push(c);
        });

        const batch = writeBatch(db);
        let deletedCount = 0;
        let updatedTxCount = 0;

        // 3. Process groups
        const victimIds: string[] = [];
        const mapping: Record<string, string> = {}; // victimId -> survivorId

        for (const name in groups) {
            const group = groups[name];
            if (group.length > 1) {
                // Sort by creation or just pick the first one?
                // Let's keep the one that looks "most complete" or just the first.
                const survivor = group[0];
                const victims = group.slice(1);

                victims.forEach(v => {
                    victimIds.push(v.id);
                    mapping[v.id] = survivor.id;
                    // Delete victim
                    const vRef = doc(db, "users", user.uid, "categories", v.id);
                    batch.delete(vRef);
                    deletedCount++;
                });
            }
        }

        if (deletedCount === 0) {
            console.log("No duplicates found.");
            return "No duplicates found.";
        }

        // 4. Update Transactions
        // We need to fetch ALL transactions to check if they use victim IDs.
        // This might be expensive if there are thousands, but for personal finance app it's distinct.
        // Optimization: Query only transactions where categoryId is in victimIds?
        // Firestore 'in' query limit is 10. `victimIds` might be large.
        // Safer to fetch all or chunk. 
        // Let's fetch all (usually < 1000).
        const txRef = collection(db, "users", user.uid, "transactions");
        const txSnap = await getDocs(txRef);

        txSnap.docs.forEach(d => {
            const tx = d.data();
            if (mapping[tx.categoriaId]) {
                const newCatId = mapping[tx.categoriaId];
                const txDocRef = doc(db, "users", user.uid, "transactions", d.id);
                batch.update(txDocRef, { categoriaId: newCatId });
                updatedTxCount++;
            }
        });

        // 5. Commit
        await batch.commit();
        const msg = `Cleanup complete: Deleted ${deletedCount} categories, Updated ${updatedTxCount} transactions.`;
        console.log(msg);
        alert(msg);
        return msg;

    } catch (e) {
        console.error("Error during cleanup:", e);
        return "Error during cleanup: " + e;
    }
};
