<script setup lang="ts">

useHead({
  title: 'Steam Price Compare - V3'
})

//const gameList = await useFetch('/api/calculate');

const columns = [
  {
    key: 'id',
    label: 'AppId',
    sortable: true,
  },
  {
    key: 'avatar',
    label: '',
  },
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'price.TR.final',
    label: 'TL',
    sortable: true,
  },
  {
    key: 'discount',
    label: 'Difference',
    sortable: true,
  },
  {
    key: 'price.AZ.final',
    label: 'CIS-(USD)',
    sortable: true,
  },
  {
    key: 'steam',
    label: ''
  }
]
const games = ref([])
const totalGames = ref(0)
const loading = ref(false)
const queryParams = ref({
  page: 1,
  perPage: 10,
  sortColumn: 'id',
  sortDirection: 'desc' as 'desc' | 'asc',
  tlMin: undefined as number | undefined,
  tlMax: undefined as number | undefined,
  name: undefined as string | undefined,
})

const tableSortParams = computed(() => {
  return {
    column: queryParams.value.sortColumn,
    direction: queryParams.value.sortDirection,
  }
})

const fetchGame = async() => {
  loading.value = true
  await $fetch('/api/game', { params: {...queryParams.value} })
  .then((data) => {
    totalGames.value = data.totalGames
    games.value = data.data
  })
  .finally(()=> loading.value = false)
}

onBeforeMount(async()=> {
  await fetchGame()
})

const updateSort = (data : {column: string, direction: 'asc'|'desc' }) => {
  queryParams.value.sortColumn = data.column
  queryParams.value.sortDirection = data.direction
}

// eg: 45875 => 458,75
const formatCurrency = (value) => {
  if (typeof value === 'number') {
    return (value / 100).toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    });
  }
  return value;
};

const fetchSlow = _debounce(() => fetchGame(), 1000)

watch(
  () => queryParams.value,
  () => {
    fetchSlow()
  },
  { deep: true}
)

</script>

<template>
  <div>
    <div class="flex flex-col max-w-[1280px] mx-auto gap-4">
      <div class="flex items-center justify-between gap-3  py-3">
        <UFormGroup label="Game Name">
          <UInput placeholder="name" icon="i-heroicons-magnifying-glass-20-solid" v-model="queryParams.name" />
        </UFormGroup>

        <div class="flex gap-3 text-center items-center">
          <UFormGroup label="TL" >
            <div class="flex gap-3">
              <UInput placeholder="min price" icon="i-heroicons-currency-yen" type="number" v-model="queryParams.tlMin" step=".01"/>
              -
              <UInput placeholder="max price" icon="i-heroicons-currency-yen" type="number" v-model="queryParams.tlMax"/>
            </div>
          </UFormGroup>
          <UFormGroup label="CIS - U.S. Dollar" v-show="false">
            <div class="flex gap-3">
              <UInput placeholder="min price" icon="i-heroicons-currency-yen" type="number" />
              -
              <UInput placeholder="max price" icon="i-heroicons-currency-yen" type="number" />
            </div>
          </UFormGroup>
        </div>
      </div>
      <UTable :loading="loading" :columns="columns" :rows="games" :sort="tableSortParams" @update:sort="updateSort" class="min-h-[600px] max-h-screen">
        <template #avatar-data="{ row }">
          <img :src="`https://cdn.akamai.steamstatic.com/steam/apps/${row.id}/header.jpg`" width="200" class="mx-auto min-w-[5rem]" />
        </template>

        <template #name-data="{ row }">
          <NuxtLink :to="`https://store.steampowered.com/app/${row.id}`" target="_blank" class="whitespace-break-spaces">
            {{ row.name }}
          </NuxtLink>
        </template>

        <template #price.TR.final-data="{ row }">
          <span>{{ row.price.TR.final_formatted }}</span>
        </template>

        <template #discount-data="{ row }">
          <div class="flex flex-col items-center" :class="{ 'text-primary-500': row.tr_currency_discount < 0, 'text-red-500': row.tr_currency_discount > 0 }">
            <span><span v-if="row.tr_currency_discount > 0">+</span>{{ formatCurrency(row.tr_currency_discount) }}</span>
            <span>% {{ row.tr_currency_discount_percent?.toFixed(2).replace('-','') }}</span>
          </div>
        </template>

        <template #price.AZ.final-data="{ row }">
          <div class="flex flex-col">
            <span>{{ row.price.AZ.final_formatted }}</span>
            <span>{{ formatCurrency(row.price.AZ.final*28.2) }}</span>
          </div>
        </template>

        <template #steam-data="{ row }">
          <NuxtLink :to="`https://store.steampowered.com/app/${row.id}`" target="_blank">
            <UButton
              icon="i-heroicons-link-solid"
              size="sm"
              color="gray"
              square
              variant="solid"
            />
          </NuxtLink>
        </template>
      </UTable>

      <div class="flex justify-between">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5">Rows per page:</span>
          <USelect
            v-model="queryParams.perPage"
            :options="[5, 10, 15, 20, 30, 40, 50]"
            class="me-2 w-20"
          />
        </div>

        <UPagination v-model="queryParams.page" :page-count="queryParams.perPage" :total="totalGames" :max="15" />
      </div>
    </div>
  </div>
</template>

<style></style>