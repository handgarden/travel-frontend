import axios, { AxiosResponse } from "axios";
import {
  PaginationQuery,
  PaginationResponse,
  ResponseTemplate,
} from "../../types/repository/basic.type";
import { useAuth } from "../../context/AuthContext";
import {
  MemberProfile,
  UpdateNicknameForm,
  UpdatePasswordForm,
  MemberProfileResponse,
  MemberDetailProfileResponse,
  MemberDetailProfile,
} from "../../types/User.type";
import { useCallback, useMemo } from "react";
import { CATEGORY } from "../../lib/const/category";
import { LoginForm, RegisterData } from "../../types/Auth.type";
import {
  UserBanRequest,
  UserListQuery,
  UserRoleUpdate,
} from "../../types/Admin.type";
import roles from "../../lib/const/auth/role";
import {
  CreateDestinationForm,
  UpdateDestinationForm,
  DestinationResponse,
  DestinationType,
} from "../../types/Destination.type";
import {
  DescriptionType,
  DescriptionForm,
  DescriptionUpdateForm,
  ItemListQuery,
} from "../../types/Description.type";
import { StoreFileName } from "../../types/File.type";
import {
  JourneyCommentForm,
  JourneyCommentType,
  JourneyCommentUpdateForm,
  JourneyContentResponse,
  JourneyContentType,
  JourneyForm,
  JourneyResponse,
  JourneyType,
} from "../../types/Journey.type";
import {
  CreateRoomForm,
  RoomDateQuery,
  RoomType,
  RoomReserveType,
  ReserveRoomForm,
} from "../../types/Room.type";
import {
  CreateCreditCardForm,
  DepositToTravelPayForm,
  PaymentMethodInFoType,
} from "../../types/Payment.type";
import QueryString from "qs";
import { RoomOrderType } from "../../types/Order.type";

const serverErrorTemplateGenerator = <K,>(): ResponseTemplate<K> => {
  return {
    success: false,
    response: null,
    error: {
      status: 500,
      message: "서버에 문제가 발생했습니다.",
      bindingErrors: [],
    },
  };
};

class Repository {
  private defaultPath: string;
  private httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_HOST,
    timeout: 5000,
    withCredentials: true,
  });
  private checkAuthFunc: (response: ResponseTemplate<Object>) => void;

  constructor(
    defaultPath: string,
    checkAuthFunc: (response: ResponseTemplate<Object>) => void
  ) {
    this.defaultPath = defaultPath;
    this.checkAuthFunc = checkAuthFunc;
  }

  public getHttpClient = () => {
    return this.httpClient;
  };

  public createPost = <
    T,
    J extends Object,
    K = J,
    P = undefined,
    Q = undefined
  >(
    path: string,
    convertData: (d: J) => K = (response: J) => response as unknown as K,
    disableCheck = false
  ) => {
    return async (request: T, pathVariable: P, query: Q) => {
      let convertedPath = path;
      if (pathVariable) {
        const splitPath = path.split("{pv}");
        const applyPath = `${splitPath[0]}${pathVariable}${splitPath[1]}`;
        convertedPath = applyPath;
      }
      if (query instanceof Object) {
        if ("page" in query) {
          const page = query["page"] as number;
          query = {
            ...query,
            page: page - 1,
          };
        }
      }
      const qs = QueryString.stringify(query, { arrayFormat: "repeat" });
      convertedPath += `?${qs}`;

      try {
        const response = await this.httpClient.post<
          T,
          AxiosResponse<ResponseTemplate<J>>
        >(this.defaultPath + convertedPath, request);
        const data = response.data;
        if (!disableCheck) {
          this.checkAuthFunc(data);
        }
        const convertedData: ResponseTemplate<K> = {
          ...data,
          response: data.response ? convertData(data.response) : null,
        };
        return convertedData;
      } catch (e) {
        return serverErrorTemplateGenerator<K>();
      }
    };
  };

  public createGet = <T extends Object, K = T, P = undefined, Q = undefined>(
    path: string,
    convertData: (r: T) => K = (response: T) => response as unknown as K,
    disableCheck = false
  ) => {
    return async (pathVariable: P, query: Q) => {
      let convertedPath = path;
      if (pathVariable) {
        const splitPath = path.split("{pv}");
        const applyPath = `${splitPath[0]}${pathVariable}${splitPath[1]}`;
        convertedPath = applyPath;
      }
      if (query instanceof Object) {
        if ("page" in query) {
          const page = query["page"] as number;
          query = {
            ...query,
            page: page - 1,
          };
        }
      }
      const qs = QueryString.stringify(query, { arrayFormat: "repeat" });
      convertedPath += `?${qs}`;

      try {
        const response = await this.httpClient.get<
          void,
          AxiosResponse<ResponseTemplate<T>>
        >(this.defaultPath + convertedPath);
        const data = response.data;
        if (!disableCheck) {
          this.checkAuthFunc(data);
        }
        const convertedData: ResponseTemplate<K> = {
          ...data,
          response: data.response ? convertData(data.response) : null,
        };
        return convertedData;
      } catch (e) {
        return serverErrorTemplateGenerator<K>();
      }
    };
  };
}

/**
 * 세션 만료 검증
 * 세션이 만료됐으면 메모리에 저장돼있는 유저 정보 제거함
 * @returns checkAuthByResponse
 */
const useCheckAuthByResponse = () => {
  const { user, logout } = useAuth();

  const checkAuthByResponse = useCallback(
    (response: ResponseTemplate<Object>) => {
      if (response.error && response.error.status === 401) {
        if (user !== null) {
          logout();
        }
      }
    },
    [logout, user]
  );

  return checkAuthByResponse;
};

const useAuthRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/auth", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postLogin = useMemo(
    () =>
      repository.createPost<LoginForm, MemberProfileResponse, MemberProfile>(
        "/login",
        (d) => ({
          ...d,
          role: roles[d.role],
        })
      ),
    [repository]
  );

  const postLoginWithSession = useMemo(
    () =>
      repository.createPost<void, MemberProfileResponse, MemberProfile>(
        "/session",
        (d) => ({
          ...d,
          role: roles[d.role],
        })
      ),
    [repository]
  );

  const postLogout = useMemo(
    () => repository.createPost<void, "ok">("/logout", undefined, true),
    [repository]
  );

  const postRegister = useMemo(
    () =>
      repository.createPost<RegisterData, "ok">("/register", undefined, true),
    [repository]
  );

  const repo = useMemo(
    () => ({
      postLogin,
      postLoginWithSession,
      postLogout,
      postRegister,
    }),
    [postLogin, postLoginWithSession, postLogout, postRegister]
  );

  return repo;
};

const useUserRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/members", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postNickname = useMemo(
    () => repository.createPost<UpdateNicknameForm, "ok">("/nickname"),
    [repository]
  );

  const postPassword = useMemo(
    () => repository.createPost<UpdatePasswordForm, "ok">("/password"),
    [repository]
  );

  const getUserDestinations = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DestinationResponse>,
      PaginationResponse<DestinationType>,
      undefined,
      ItemListQuery
    >(
      "/destinations",
      (response: PaginationResponse<DestinationResponse>) => {
        return {
          ...response,
          data: response.data.map((d) => ({
            ...d,
            category: CATEGORY[d.category],
          })),
        };
      },
      true
    );
  }, [repository]);

  const getUserDescriptions = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DescriptionType>,
      PaginationResponse<DescriptionType>,
      undefined,
      PaginationQuery
    >("/descriptions");
  }, [repository]);

  const getUserJourneys = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyResponse>,
      PaginationResponse<JourneyType>,
      undefined,
      PaginationQuery
    >("/journeys", (d) => ({
      ...d,
      data: d.data.map((j) => ({
        ...j,
        journeyContents: j.journeyContents.map((c) => ({
          ...c,
          destination: {
            ...c.destination,
            category: CATEGORY[c.destination.category],
          },
        })),
      })),
    }));
  }, [repository]);

  const getUserComments = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyCommentType>,
      PaginationResponse<JourneyCommentType>,
      undefined,
      PaginationQuery
    >("/comments", (d) => d);
  }, [repository]);

  const repo = useMemo(
    () => ({
      postNickname,
      postPassword,
      getUserDescriptions,
      getUserJourneys,
      getUserComments,
      getUserDestinations,
    }),
    [
      getUserComments,
      getUserDescriptions,
      getUserDestinations,
      getUserJourneys,
      postNickname,
      postPassword,
    ]
  );

  return repo;
};

const useAdminRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/admin", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getMemberProfiles = useMemo(
    () =>
      repository.createGet<
        PaginationResponse<MemberProfileResponse>,
        PaginationResponse<MemberProfile>,
        undefined,
        UserListQuery
      >("/members", (d) => ({
        ...d,
        data: d.data.map((m) => ({ ...m, role: roles[m.role] })),
      })),
    [repository]
  );

  const getUserDetail = useMemo(
    () =>
      repository.createGet<
        MemberDetailProfileResponse,
        MemberDetailProfile,
        string
      >("/members/{pv}", (d) => ({
        ...d,
        role: roles[d.role],
      })),
    [repository]
  );

  const postNickname = useMemo(
    () => repository.createPost<UpdateNicknameForm, "ok">("/members/nickname"),
    [repository]
  );

  const postRole = useMemo(
    () => repository.createPost<UserRoleUpdate, "ok">("/members/role"),
    [repository]
  );

  const postBan = useMemo(
    () => repository.createPost<UserBanRequest, "ok">("/members/ban"),
    [repository]
  );

  const postUnban = useMemo(
    () =>
      repository.createPost<void, "ok", "ok", string>("/members/unban/{pv}"),
    [repository]
  );

  const repo = useMemo(
    () => ({
      getUserInfoList: getMemberProfiles,
      getUserDetail,
      postNickname,
      postRole,
      postBan,
      postUnban,
    }),
    [
      getUserDetail,
      getMemberProfiles,
      postBan,
      postNickname,
      postRole,
      postUnban,
    ]
  );

  return repo;
};

const useDestinationRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/destinations", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getDestinations = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DestinationResponse>,
      PaginationResponse<DestinationType>,
      undefined,
      ItemListQuery
    >(
      "",
      (response: PaginationResponse<DestinationResponse>) => {
        return {
          ...response,
          data: response.data.map((d) => ({
            ...d,
            category: CATEGORY[d.category],
          })),
        };
      },
      true
    );
  }, [repository]);

  const getDestination = useMemo(() => {
    return repository.createGet<DestinationResponse, DestinationType, string>(
      "/{pv}",
      (d: DestinationResponse) => {
        return {
          ...d,
          category: CATEGORY[d.category],
        };
      },
      true
    );
  }, [repository]);

  const getDestinationThumnails = useMemo(() => {
    return repository.createGet<
      PaginationResponse<StoreFileName>,
      PaginationResponse<StoreFileName>,
      string,
      PaginationQuery
    >("/{pv}/thumbnails");
  }, [repository]);

  const postDestination = useMemo(
    () => repository.createPost<CreateDestinationForm, "ok">(""),
    [repository]
  );

  const updateDestination = useMemo(() => {
    return repository.createPost<UpdateDestinationForm, "ok", "ok", string>(
      "/{pv}"
    );
  }, [repository]);

  const deleteDestination = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/destinations/${id}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const getDescriptions = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DescriptionType>,
      PaginationResponse<DescriptionType>,
      string,
      PaginationQuery
    >("/{pv}/descriptions");
  }, [repository]);

  const postDescription = useMemo(() => {
    return repository.createPost<
      DescriptionForm,
      DescriptionType,
      DescriptionType,
      string
    >("/{pv}/descriptions");
  }, [repository]);

  const repo = useMemo(
    () => ({
      postDestination,
      updateDestination,
      deleteDestination,
      getDestination,
      getDestinationThumnails,
      getDestinations,
      getDescriptions,
      postDescription,
    }),
    [
      postDestination,
      updateDestination,
      deleteDestination,
      getDestination,
      getDestinationThumnails,
      getDestinations,
      getDescriptions,
      postDescription,
    ]
  );

  return repo;
};

const useDescriptionRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/descriptions", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const updateDescription = useMemo(() => {
    return repository.createPost<
      DescriptionUpdateForm,
      DescriptionType,
      DescriptionType,
      string
    >("/{pv}");
  }, [repository]);

  const deleteDescription = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/descriptions/${id}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      updateDescription,
      deleteDescription,
    }),
    [deleteDescription, updateDescription]
  );

  return repo;
};

const useFileRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/files", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postRemove = useCallback(
    async (storeFileName: string) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/files/${storeFileName}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(() => ({ postRemove }), [postRemove]);

  return repo;
};

const useJourneyRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/journeys", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const journeyContentResponseToObj = useCallback(
    (j: JourneyContentResponse): JourneyContentType => ({
      ...j,
      destination: {
        ...j.destination,
        category: CATEGORY[j.destination.category],
      },
    }),
    []
  );

  const getJourneyContent = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyContentResponse>,
      PaginationResponse<JourneyContentType>,
      undefined,
      PaginationQuery
    >(
      "/contents",
      (d) => ({
        ...d,
        data: d.data.map((j) => journeyContentResponseToObj(j)),
      }),
      false
    );
  }, [journeyContentResponseToObj, repository]);

  const getAllJourney = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyResponse>,
      PaginationResponse<JourneyType>,
      undefined,
      PaginationQuery
    >(
      "",
      (d) => ({
        ...d,
        data: d.data.map((j) => ({
          ...j,
          journeyContents: j.journeyContents.map((c) => ({
            ...c,
            destination: {
              ...c.destination,
              category: CATEGORY[c.destination.category],
            },
          })),
        })),
      }),
      false
    );
  }, [repository]);

  const getJourney = useMemo(() => {
    return repository.createGet<JourneyResponse, JourneyType, string>(
      "/{pv}",
      (d) => ({
        ...d,
        journeyContents: d.journeyContents.map((c) => ({
          ...c,
          destination: {
            ...c.destination,
            category: CATEGORY[c.destination.category],
          },
        })),
      }),
      false
    );
  }, [repository]);

  const postJourney = useMemo(
    () => repository.createPost<JourneyForm, "ok">(""),
    [repository]
  );

  const updateJourney = useMemo(
    () => repository.createPost<JourneyForm, "ok", "ok", string>("/{pv}"),
    [repository]
  );

  const deleteJourney = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/journeys/${id}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  //코멘트 추가후에 ui 상에서 추가해줘야함
  //이때 데이터를 서버에서 안주면 id, 생성일 등을 무작위로 만들어서 저장해야함
  //이후에 복잡해지므로 서버에서 생성 후 반환으로 데이터 넘기도록 변경
  const postComment = useMemo(() => {
    return repository.createPost<
      JourneyCommentForm,
      JourneyCommentType,
      JourneyCommentType,
      string
    >("/{pv}/comments");
  }, [repository]);

  const getComments = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyCommentType>,
      PaginationResponse<JourneyCommentType>,
      string,
      PaginationQuery
    >("/{pv}/comments");
  }, [repository]);

  const updateComment = useMemo(() => {
    return repository.createPost<
      JourneyCommentUpdateForm,
      JourneyCommentType,
      JourneyCommentType,
      string
    >("/comments/{pv}");
  }, [repository]);

  const deleteComment = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/journeys/comments/${id}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      getJourneyContent,
      getAllJourney,
      getJourney,
      postJourney,
      updateJourney,
      deleteJourney,
      postComment,
      getComments,
      updateComment,
      deleteComment,
    }),
    [
      getJourneyContent,
      getAllJourney,
      getJourney,
      postJourney,
      updateJourney,
      deleteJourney,
      postComment,
      getComments,
      updateComment,
      deleteComment,
    ]
  );

  return repo;
};

const useAccommodationRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/accommodations", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getRoomsForReserve = useMemo(() => {
    return repository.createGet<
      RoomReserveType[],
      RoomReserveType[],
      string,
      RoomDateQuery
    >("/{pv}");
  }, [repository]);

  const getRoomsByProducer = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomType>,
      PaginationResponse<RoomType>,
      void,
      PaginationQuery
    >("/rooms");
  }, [repository]);

  const getRoom = useMemo(() => {
    return repository.createGet<RoomType, RoomType, number, void>(
      "/rooms/{pv}"
    );
  }, [repository]);

  const createRoom = useMemo(() => {
    return repository.createPost<CreateRoomForm, "ok", "ok", number>("/{pv}");
  }, [repository]);

  const reserveRoom = useMemo(() => {
    return repository.createPost<ReserveRoomForm, "ok", "ok", number>(
      "/rooms/{pv}"
    );
  }, [repository]);

  const confirmOrder = useMemo(() => {
    return repository.createPost<void, "ok", "ok", number>(
      "/orders/{pv}/confirm"
    );
  }, [repository]);

  const cancelOrder = useMemo(() => {
    return repository.createPost<void, "ok", "ok", number>(
      "/orders/{pv}/cancel"
    );
  }, [repository]);

  const getOrders = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomOrderType>,
      PaginationResponse<RoomOrderType>,
      undefined,
      PaginationQuery
    >("/orders");
  }, [repository]);

  const getOrdersByRoom = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomOrderType>,
      PaginationResponse<RoomOrderType>,
      number,
      PaginationQuery
    >("/orders/rooms/{pv}");
  }, [repository]);

  const repo = useMemo(
    () => ({
      getRoomsForReserve,
      getRoomsByProducer,
      createRoom,
      getRoom,
      reserveRoom,
      getOrders,
      confirmOrder,
      cancelOrder,
      getOrdersByRoom,
    }),
    [
      cancelOrder,
      confirmOrder,
      createRoom,
      getOrders,
      getOrdersByRoom,
      getRoom,
      getRoomsByProducer,
      getRoomsForReserve,
      reserveRoom,
    ]
  );

  return repo;
};

const usePaymentRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/payment", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getPaymentMethod = useMemo(() => {
    return repository.createGet<PaymentMethodInFoType>("");
  }, [repository]);

  const depositTravelPay = useMemo(() => {
    return repository.createPost<DepositToTravelPayForm, "ok">("/deposit");
  }, [repository]);

  const createCreditCard = useMemo(() => {
    return repository.createPost<CreateCreditCardForm, number>("");
  }, [repository]);

  const deleteCreditCard = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/payment/${id}`
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      getPaymentMethod,
      depositTravelPay,
      createCreditCard,
      deleteCreditCard,
    }),
    [createCreditCard, deleteCreditCard, depositTravelPay, getPaymentMethod]
  );

  return repo;
};

const useRepository = () => {
  const UserRepository = useUserRepository();
  const AuthRepository = useAuthRepository();
  const AdminRepository = useAdminRepository();
  const DestinationRepository = useDestinationRepository();
  const FileRepository = useFileRepository();
  const JourneyRepository = useJourneyRepository();
  const DescriptionRepository = useDescriptionRepository();
  const AccommodationRepository = useAccommodationRepository();
  const PaymentRepository = usePaymentRepository();

  const repo = useMemo(
    () => ({
      UserRepository,
      AuthRepository,
      AdminRepository,
      DestinationRepository,
      DescriptionRepository,
      FileRepository,
      JourneyRepository,
      AccommodationRepository,
      PaymentRepository,
    }),
    [
      UserRepository,
      AuthRepository,
      AdminRepository,
      DestinationRepository,
      DescriptionRepository,
      FileRepository,
      JourneyRepository,
      AccommodationRepository,
      PaymentRepository,
    ]
  );

  return repo;
};

export default useRepository;
