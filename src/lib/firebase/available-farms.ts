import {
  getFirebaseFirestore,
} from "./admin";
import {
  AvailableFarm,
  parseAvailableFarm,
} from "./farm";

export async function getAvailableFarms():
  Promise<AvailableFarm[]> {
  const snapshot =
    await getFirebaseFirestore()
      .collection("farms")
      .where(
        "isActive",
        "==",
        true,
      )
      .where(
        "isAccepting",
        "==",
        true,
      )
      .get();

  const farms = snapshot.docs.map(
    (document) =>
      parseAvailableFarm(
        document.id,
        document.data(),
      ),
  );

  if (
    farms.some(
      (farm) => farm === null,
    )
  ) {
    throw new Error(
      "農園データを取得できませんでした。",
    );
  }

  return (
    farms as AvailableFarm[]
  ).sort((left, right) =>
    left.name.localeCompare(
      right.name,
      "ja",
    ),
  );
}

